import { FastifyReply, FastifyRequest } from 'fastify';
import { z } from 'zod';

import getKeySchema from '@api/schemas/DICT/getKeySchema';
import zodValidator from '@api/util/zodValidator';

import buildXml from '@api/util/buildXml';
import errors from '@api/util/errors';
import logger from '@repo/infra/logger';
import database from '@repo/infra/database';

export default async (req: FastifyRequest<{
    Params: {
        key: string
    };
}>, res: FastifyReply) => {
    // Getting Key Param
    const params = req.params;

    // Checking if key exceeds 77 length max
    const parsed_path: { err: unknown | null, data: z.infer<typeof getKeySchema> | null } = zodValidator(getKeySchema)((params), false);
    if(parsed_path.err) {
        return res.code(400).headers({ "content-type": "application/problem+xml" }).send(buildXml(parsed_path.err));
    }
    
    try {
        const queryKey = 'SELECT * FROM tb_Entries WHERE key = ?';
        const parsedKey = parsed_path.data?.key;
        const queriedKey = await database.get_sync(queryKey, [parsedKey]);
        
        if(!queriedKey) {
            return res.code(404).headers({
                "content-type": "problem+xml"
            }).send(errors.not_found());
        }

        const queryAccount = 'SELECT * FROM tb_Accounts WHERE accountNumber = ?';
        const queriedAccount = await database.get_sync(queryAccount, [queriedKey.accountNumber]);

        const queryOwner = 'SELECT * FROM tb_Owners WHERE taxIdNumber = ?';
        const queriedOwner = await database.get_sync(queryOwner, [queriedKey.taxIdNumber]);

        const correlationId = crypto.randomUUID();
        return res.code(200).headers({
            "content-type": "application/xml"
        }).send(buildXml({
            GetEntryResponse: {
                Signature: '',
                ResponseTime: new Date().toISOString(),
                CorrelationId: correlationId,
                Entry: {
                    Key: queriedKey.key,
                    KeyType: queriedKey.keyType,
                    Account: {
                        Participant: queriedAccount.participant,
                        Branch: queriedAccount.branch,
                        AccountNumber: queriedAccount.accountNumber,
                        AccountType: queriedAccount.accountType,
                        OpeningDate: queriedAccount.openingDate
                    },
                    Owner: {
                        Type: queriedOwner.type,
                        TaxIdNumber: queriedOwner.taxIdNumber,
                        Name: queriedOwner.name
                    }
                }
            }
        }))
    } catch (e) {
        logger.error(e);
        return res.code(503)
        .headers({"content-type": "application/problem+xml"})
        .send(errors.not_found());
    }
}