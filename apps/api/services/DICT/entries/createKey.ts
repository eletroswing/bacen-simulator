import { FastifyReply, FastifyRequest } from 'fastify';
import { z } from 'zod';

import buildXml from '@api/util/buildXml';
import zodValidator from '@api/util/zodValidator';
import createEntrySchema from '@api/schemas/DICT/createEntrySchema';

import database from '@repo/infra/database';
import errors from '@api/util/errors';
import logger from '@repo/infra/logger';
import statusCode from '@api/util/statusCode';

export default async (req: FastifyRequest, res: FastifyReply) => {
    const parsed_body: { err: unknown | null, data: z.infer<typeof createEntrySchema> | null } = zodValidator(createEntrySchema, req);
    if (parsed_body.err || !parsed_body.data) {
        return res.code(statusCode.BAD_REQUEST).headers({ "content-type": "application/problem+xml" }).send(buildXml(parsed_body.err));
    };

    try {
        const { CreateEntryRequest: {
            RequestId,
            Signature,
            Entry: {
                Account,
                Key,
                Owner,
                KeyType
            },
        } }: z.infer<typeof createEntrySchema> = parsed_body.data;

        const queries_result: any[] = await Promise.allSettled([
            new Promise(async (resolve, reject) => {
                try {
                    const query_account = 'SELECT * FROM tb_Accounts WHERE accountNumber = ? AND participant = ?';
                    const account = await database.get_sync(query_account, [Account.AccountNumber, Account.Participant]);
                    resolve(account)
                } catch (e: unknown) {
                    reject(e)
                }
            }),
            new Promise(async (resolve, reject) => {
                try {
                    const query_owner = 'SELECT * FROM tb_Owners WHERE taxIdNumber = ? AND type = ? AND tradeName = ? AND name = ?';
                    const owner = await database.get_sync(query_owner, [Owner.TaxIdNumber, Owner.Type, Owner.TradeName || 'null', Owner.Name]);
                    resolve(owner)
                } catch (e: unknown) {
                    reject(e)
                }
            }),
            new Promise(async (resolve, reject) => {
                try {
                    const query_key = 'SELECT * FROM tb_Entries WHERE key = ? AND taxIdNumber = ? AND accountNumber = ?';
                    const account_key = await database.get_sync(query_key, [Key, Owner.TaxIdNumber, Account.AccountType]);
                    resolve(account_key)
                } catch (e: unknown) {
                    reject(e)
                }
            })
        ])

        if (!queries_result[0].value || !queries_result[1].value || queries_result[2].value) return res.code(statusCode.FORBIDDEN).headers({
            "content-type": "application/problem+xml"
        }).send(errors.forbidden());

        await database.run_sync(`INSERT INTO tb_Entries VALUES (?, ?, ?, ?, ?, ?)`, [
            Key,
            Owner.TaxIdNumber,
            Account.AccountNumber,
            KeyType,
            new Date().toISOString(),
            new Date().toISOString()
        ]);

        return res.code(201).headers({ "content-type": "application/xml" }).send(buildXml({
            CreateEntryResponse: {
                Signature: Signature,
                ResponseTime: new Date().toISOString(),
                CorrelationId: RequestId,
                Entry: {
                    Key: Key,
                    KeyType: KeyType,
                    Account: Account,
                    Owner: Owner,
                    CreationDate: new Date().toISOString(),
                    KeyOwnershipDate: new Date().toISOString()
                },
            }
        }));
    } catch (e: unknown) {
        logger.warn(e);
        return res.code(statusCode.SERVICE_UNAVAIBLE).headers({
            "content-type": "application/problem+xml"
        }).send(errors.service_unvaible());
    }
}