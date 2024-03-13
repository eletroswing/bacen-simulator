import { FastifyReply, FastifyRequest } from 'fastify';
import { z } from 'zod';
import crypto from 'crypto';

import buildXml from '@api/util/buildXml';
import zodValidator from '@api/util/zodValidator';
import createEntrySchema from '@api/schemas/DICT/createEntrySchema';

import database from '@repo/infra/database';
import errors from '@api/util/errors';
import logger from '@repo/infra/logger';

export default async (req: FastifyRequest, res: FastifyReply) => {
    const parsed_body: { err: unknown | null, data: z.infer<typeof createEntrySchema> | null } = zodValidator(createEntrySchema)(req);
    if (parsed_body.err) {
        return res.code(400).headers({ "content-type": "application/problem+xml" }).send(buildXml(parsed_body.err));
    };

    try {
        const query = 'SELECT * FROM institutions WHERE participant = ? AND branch = ?';
        const participant = parsed_body.data?.CreateEntryRequest.Entry.Account.Participant.toString().padStart(8, '0');
        const branch = parsed_body.data?.CreateEntryRequest.Entry.Account.Branch.toString().padStart(4, '0');
        const institution = await database.get_sync(query, [participant, branch]);


        const query_account = 'SELECT * FROM accounts WHERE account_number = ? AND account_type = ? AND institution = ?';
        const account_number = parsed_body.data?.CreateEntryRequest.Entry.Account.AccountNumber.toString().padStart(20, '0');
        const account_type = parsed_body.data?.CreateEntryRequest.Entry.Account.AccountType.toString();
        const account = await database.get_sync(query_account, [account_number, account_type, institution.id]);

        var query_key = 'SELECT * FROM keys WHERE key = ? AND key_type = ? AND person_type = ? AND tax_id = ? AND name = ?';
        const key = parsed_body.data?.CreateEntryRequest.Entry.Key.toString();
        const key_type = parsed_body.data?.CreateEntryRequest.Entry.KeyType.toString();
        const person_type = parsed_body.data?.CreateEntryRequest.Entry.Owner.Type.toString();
        const tax_id = parsed_body.data?.CreateEntryRequest.Entry.Owner.TaxIdNumber.toString();
        const name = parsed_body.data?.CreateEntryRequest.Entry.Owner.Name.toString();
        const params = [key, key_type, person_type, tax_id, name]

        const account_key = await database.get_sync(query_key, params);

        if (!institution || !account || account_key) return res.code(403).headers({
            "content-type": "application/problem+xml"
        }).send(errors.forbidden());

        const query_create_key = `INSERT INTO keys  VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;
        await database.run_sync(query_create_key, [
            crypto.randomUUID(),
            parsed_body.data?.CreateEntryRequest.Entry.Key.toString(),
            parsed_body.data?.CreateEntryRequest.Entry.KeyType.toString(), 
            parsed_body.data?.CreateEntryRequest.Entry.Owner.Type.toString(), 
            parsed_body.data?.CreateEntryRequest.Entry.Owner.TaxIdNumber.toString(),
            parsed_body.data?.CreateEntryRequest.Entry.Owner.Name.toString(), 
            parsed_body.data?.CreateEntryRequest.Entry.Owner.TradeName?.toString(),
            account.id
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
                        Particint: parsed_body.data?.CreateEntryRequest.Entry.Account.Participant,
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