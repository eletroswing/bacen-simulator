import { FastifyReply, FastifyRequest } from 'fastify';
import { z } from 'zod';

import buildXml from '@api/util/buildXml';
import zodValidator from '@api/util/zodValidator';
import createEntrySchema from '@api/schemas/DICT/createEntrySchema';

import database from '@repo/infra/database';
import errors from '@api/util/errors';
import logger from '@repo/infra/logger';

export default async (req: FastifyRequest, res: FastifyReply) => {
    const parsed_body: { err: unknown | null, data: z.infer<typeof createEntrySchema> | null } = zodValidator(createEntrySchema, req);
    if (parsed_body.err) {
        return res.code(400).headers({ "content-type": "application/problem+xml" }).send(buildXml(parsed_body.err));
    };

    try {
        const participant = parsed_body.data?.CreateEntryRequest.Entry.Account.Participant.toString().padStart(8, '0');
        const query_account = 'SELECT * FROM tb_Accounts WHERE accountNumber = ? AND participant = ?';
        const account_number = parsed_body.data?.CreateEntryRequest.Entry.Account.AccountNumber.toString().padStart(20, '0');
        const account = await database.get_sync(query_account, [account_number, participant]);

        if (!account) return res.code(403).headers({
            "content-type": "application/problem+xml"
        }).send(errors.forbidden());

        const query_owner = 'SELECT * FROM tb_Owners WHERE taxIdNumber = ? AND type = ? AND tradeName = ? AND name = ?';
        const tax_id = parsed_body.data?.CreateEntryRequest.Entry.Owner.TaxIdNumber.toString();
        const type = parsed_body.data?.CreateEntryRequest.Entry.Owner.Type.toString();
        const name = parsed_body.data?.CreateEntryRequest.Entry.Owner.Name.toString();
        const tradeName = parsed_body.data?.CreateEntryRequest.Entry.Owner.TradeName ? parsed_body.data?.CreateEntryRequest.Entry.Owner.TradeName.toString() : `null`;
        const owner = await database.get_sync(query_owner, [tax_id, type, tradeName, name]);

        if (!owner) return res.code(403).headers({
            "content-type": "application/problem+xml"
        }).send(errors.forbidden());

        const query_key = 'SELECT * FROM tb_Entries WHERE key = ? AND taxIdNumber = ? AND accountNumber = ?';
        const key = parsed_body.data?.CreateEntryRequest.Entry.Key.toString();
        const account_key = await database.get_sync(query_key, [key, tax_id, account_number]);

        if (account_key) return res.code(403).headers({
            "content-type": "application/problem+xml"
        }).send(errors.forbidden());

        const query_create_key = `INSERT INTO tb_Entries VALUES (?, ?, ?, ?, ?, ?)`;
        await database.run_sync(query_create_key, [
            parsed_body.data?.CreateEntryRequest.Entry.Key.toString(),
            parsed_body.data?.CreateEntryRequest.Entry.Owner.TaxIdNumber.toString(),
            parsed_body.data?.CreateEntryRequest.Entry.Account.AccountNumber.toString(),
            parsed_body.data?.CreateEntryRequest.Entry.KeyType.toString(), 
            new Date().toISOString(),
            new Date().toISOString()
        ]);

        return res.code(201).headers({ "content-type": "application/xml" }).send(buildXml({
            CreateEntryResponse: {
                Signature: parsed_body.data?.CreateEntryRequest.Signature,
                ResponseTime: new Date().toISOString(),
                CorrelationId: parsed_body.data?.CreateEntryRequest.RequestId,
                Entry: {
                    Key: parsed_body.data?.CreateEntryRequest.Entry.Key,
                    KeyType: parsed_body.data?.CreateEntryRequest.Entry.KeyType,
                    Account: {
                        Participant: parsed_body.data?.CreateEntryRequest.Entry.Account.Participant,
                        Branch: parsed_body.data?.CreateEntryRequest.Entry.Account.Branch,
                        AccountNumber: parsed_body.data?.CreateEntryRequest.Entry.Account.AccountNumber,
                        AccountType: parsed_body.data?.CreateEntryRequest.Entry.Account.AccountType,
                        OpeningDate: parsed_body.data?.CreateEntryRequest.Entry.Account.OpeningDate,
                    },
                    Owner: {
                        Type: parsed_body.data?.CreateEntryRequest.Entry.Owner.Type,
                        TaxIdNumber: parsed_body.data?.CreateEntryRequest.Entry.Owner.TaxIdNumber,
                        Name: parsed_body.data?.CreateEntryRequest.Entry.Owner.Name,
                    },
                    CreationDate: new Date().toISOString(),
                    KeyOwnershipDate: new Date().toISOString()
                },
              }
        }));
    } catch (e: unknown) {
        logger.warn(e);
        return res.code(503).headers({
            "content-type": "application/problem+xml"
        }).send(errors.service_unvaible());
    }
}