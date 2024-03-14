import { FastifyReply, FastifyRequest } from 'fastify';
import { z } from 'zod';

import updateEntrySchema from '@api/schemas/DICT/updateEntrySchema'
import keyPathSchema from '@api/schemas/DICT/keyPathSchema';
import zodValidator from '@api/util/zodValidator';

import buildXml from '@api/util/buildXml';
import database from '@repo/infra/database';
import logger from '@repo/infra/logger';
import errors from '@api/util/errors';

export default async (req: FastifyRequest<{
    Params: {
        key: string
    }
}>, res: FastifyReply) => {
    const parsed_path: { err: unknown | null, data: z.infer<typeof keyPathSchema> | null } = zodValidator(keyPathSchema, req.params);
    if(parsed_path.err) {
        return res.code(400).headers({ "content-type": "application/problem+xml" }).send(buildXml(parsed_path.err));
    }

    const parsed_body: { err: unknown | null, data: z.infer<typeof updateEntrySchema> | null } = zodValidator(updateEntrySchema, req);
    if (parsed_body.err) {
        return res.code(400).headers({ "content-type": "application/problem+xml" }).send(buildXml(parsed_body.err));
    };

    // TODO: Added an error when key path and body key are different (after generic bad request constructor)
    // if(parsed_body.data?.Key !== parsed_path.data?.key) {
    //     return res.code(400).headers({
    //         "content-type": "application/problem+xml"
    //     }).send(buildXml({
    //         problem: {
    //             "@xmlns": "urn:ietf:rfc:7807",
    //             type: "https://dict.pi.rsfn.net.br/api/v2/error/BadRequest",
    //             title: "Bad Request",
    //             status: 400,
    //             detail: "Path key is different from payload key"
    //         }
    //     }))
    // }

    try {
        const queryEntry = `SELECT * FROM tb_Entries WHERE key = ?`;
        const queriedEntry = await database.get_sync(queryEntry, [parsed_path.data?.key]);

        if(!queriedEntry) {
            return res.code(404).headers({
                "content-type": "application/problem+xml"
            }).send(buildXml(errors.not_found()));
        }

        if(queriedEntry.type === 'EVP' && parsed_body.data?.UpdateEntryRequest.Reason === 'USER_REQUESTED') {
            return res.code(403).headers({
                "content-type": "application/problem+xml"
            }).send(buildXml(errors.forbidden()))
        }

        const queryOwner = `SELECT * FROM tb_Owners WHERE taxIdNumber = ?`;
        const queriedOwner = await database.get_sync(queryOwner, [queriedEntry.taxIdNumber]);

        if(queriedOwner.type === 'NATURAL_PERSON') {
            // const updateAccounts = `UPDATE tb_Accounts SET participant = ?, branch = ?, accountType = ?, openingDate = ? WHERE accountNumber = ?`;
            // const updateOwners = `UPDATE tb_Owners SET name = ? WHERE taxIdNumber = ?`;
            // const updateAccountsParams = [parsed_body.data?.UpdateEntryRequest.Account.Participant, parsed_body.data?.UpdateEntryRequest.Account.Branch, parsed_body.data?.UpdateEntryRequest.Account.AccountType, parsed_body.data?.UpdateEntryRequest.Account.OpeningDate, queriedEntry.accountNumber];
            // const updateOwnersParams = [parsed_body.data?.UpdateEntryRequest.Owner.Name, queriedOwner.taxIdNumber];
            // const accountsSql = await database.get_sync(updateAccounts, updateAccountsParams);
            // const ownersSql = await database.get_sync(updateOwners, updateOwnersParams);
            const updateSql = `UPDATE tb_Accounts SET participant = ${parsed_body.data?.UpdateEntryRequest.Account.Participant}, branch = ${parsed_body.data?.UpdateEntryRequest.Account.Branch}, accountType = ${parsed_body.data?.UpdateEntryRequest.Account.AccountType}, openingDate = ${parsed_body.data?.UpdateEntryRequest.Account.OpeningDate} WHERE accountNumber = ${queriedEntry.accountNumber};
            UPDATE tb_Owners SET type=${parsed_body.data?.UpdateEntryRequest.Owner.Type}, name = ${parsed_body.data?.UpdateEntryRequest.Owner.Name} WHERE taxIdNumber = ${queriedOwner.taxIdNumber}`;
            const updatedSql = await database.get_sync(updateSql, []);
        }else {
            const updateSql = `UPDATE tb_Accounts SET participant = ${parsed_body.data?.UpdateEntryRequest.Account.Participant}, branch = ${parsed_body.data?.UpdateEntryRequest.Account.Branch}, accountType = ${parsed_body.data?.UpdateEntryRequest.Account.AccountType}, openingDate = ${parsed_body.data?.UpdateEntryRequest.Account.OpeningDate} WHERE accountNumber = ${queriedEntry.accountNumber};
            UPDATE tb_Owners SET type=${parsed_body.data?.UpdateEntryRequest.Owner.Type}, name = ${parsed_body.data?.UpdateEntryRequest.Owner.Name}, tradeName=${parsed_body.data?.UpdateEntryRequest.Owner.TradeName} WHERE taxIdNumber = ${queriedOwner.taxIdNumber}`;
            const updatedSql = await database.get_sync(updateSql, []);
        }

        return res.code(200).headers({
            "content-type": "application/xml"
        }).send(buildXml({
            updateEntryResponse: {
                Signature: '',
                ResponseTime: new Date().toISOString(),
                CorrelationId: crypto.randomUUID(),
                Entry: {
                    Key: parsed_path.data?.key,
                    KeyType: queriedEntry.type,
                    Account: {
                        Participant: parsed_body.data?.UpdateEntryRequest.Account.Participant,
                        Branch: parsed_body.data?.UpdateEntryRequest.Account.Branch,
                        AccountNumber: parsed_body.data?.UpdateEntryRequest.Account.AccountNumber,
                        AccountType: parsed_body.data?.UpdateEntryRequest.Account.AccountType,
                        OpeningDate: parsed_body.data?.UpdateEntryRequest.Account.OpeningDate,
                    },
                    Owner: {
                        Type: parsed_body.data?.UpdateEntryRequest.Owner.Type,
                        TaxIdNumber: queriedOwner.taxIdNumber,
                        Name: parsed_body.data?.UpdateEntryRequest.Owner.Name,
                        TradeName: parsed_body.data?.UpdateEntryRequest.Owner.TradeName,
                    },
                    CreationDate: queriedEntry.creationDate,
                    KeyOwnershipDate: queriedEntry.keyOwnershipDate
                }
            }
        }));
        
    } catch (e) {
        // TODO: Treat SQLite exceptions and throw different errors
        logger.error(e);
        return res.code(503)
        .headers({"content-type": "application/problem+xml"})
        .send(errors.service_unvaible());
    }
}