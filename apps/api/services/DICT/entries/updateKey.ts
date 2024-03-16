import { FastifyReply, FastifyRequest } from 'fastify';
import { z } from 'zod';

import updateEntrySchema from '@api/schemas/DICT/updateEntrySchema'
import zodValidator from '@api/util/zodValidator';

import buildXml from '@api/util/buildXml';
import database from '@repo/infra/database';
import logger from '@repo/infra/logger';
import errors from '@api/util/errors';
import statusCode from '@api/util/statusCode';

export default async (req: FastifyRequest<{
    Params: {
        key: string
    }
}>, res: FastifyReply) => {
    var { body }: { body: any } = req;
    body.key = req.params.key;

    const parsed_body: { err: unknown | null, data: z.infer<typeof updateEntrySchema> | null } = zodValidator(updateEntrySchema, body);
    if (parsed_body.err || !parsed_body.data) {
        return res.code(statusCode.BAD_REQUEST).headers({ "content-type": "application/problem+xml" }).send(buildXml(parsed_body.err));
    };

    try {
        const {
            key,
            UpdateEntryRequest: {
                Account,
                Owner,
                Signature
            } }: z.infer<typeof updateEntrySchema> = parsed_body.data;

        const queriedEntry = await database.get_sync(`SELECT * FROM tb_Entries WHERE key = ?`, [key]);

        if (!queriedEntry) return res.code(statusCode.NOT_FOUND).headers({
            "content-type": "application/problem+xml"
        }).send(errors.not_found());

        if (queriedEntry.type === 'EVP' && parsed_body.data?.UpdateEntryRequest.Reason === 'USER_REQUESTED') return res.code(statusCode.FORBIDDEN).headers({
            "content-type": "application/problem+xml"
        }).send(errors.forbidden())

        await database.exec_sync(`BEGIN TRANSACTION`);
        try {
            await database.run_sync(`UPDATE tb_Accounts SET participant = ?, branch = ?, accountType = ?, openingDate = ? WHERE accountNumber = ?`, [Account.Participant, Account.Branch, Account.AccountType, Account.OpeningDate, queriedEntry.accountNumber])
            await database.run_sync(`UPDATE tb_Owners SET type = ?, name = ?, tradeName = ? WHERE taxIdNumber = ?`, [Owner.Type, Owner.Name, Owner.TradeName || "null", queriedEntry.taxIdNumber])
            await database.exec_sync(`COMMIT`);
        } catch (e: unknown) {
            await database.exec_sync(`ROLLBACK`);
            logger.error(e);
            return res.code(statusCode.SERVICE_UNAVAIBLE)
                .headers({ "content-type": "application/problem+xml" })
                .send(errors.service_unvaible());
        }

        return res.code(statusCode.OK).headers({
            "content-type": "application/xml"
        }).send(buildXml({
            updateEntryResponse: {
                Signature: Signature,
                ResponseTime: new Date().toISOString(),
                CorrelationId: crypto.randomUUID(),
                Entry: {
                    Key: key,
                    KeyType: queriedEntry.type,
                    Account: Account,
                    Owner: Owner,
                    CreationDate: queriedEntry.creationDate,
                    KeyOwnershipDate: queriedEntry.keyOwnershipDate
                }
            }
        }));
    } catch (e) {
        logger.error(e);
        return res.code(statusCode.SERVICE_UNAVAIBLE)
            .headers({ "content-type": "application/problem+xml" })
            .send(errors.service_unvaible());
    }
}