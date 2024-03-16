import { FastifyReply, FastifyRequest } from 'fastify';
import { z } from 'zod';

import keyPathSchema from '@api/schemas/DICT/keyPathSchema';
import zodValidator from '@api/util/zodValidator';

import buildXml from '@api/util/buildXml';
import errors from '@api/util/errors';
import logger from '@repo/infra/logger';
import database from '@repo/infra/database';
import statusCode from '@api/util/statusCode';

export default async (req: FastifyRequest<{
    Params: {
        key: string
    };
}>, res: FastifyReply) => {
    // Checking if key exceeds 77 length max
    const parsed_path: { err: unknown | null, data: z.infer<typeof keyPathSchema> | null } = zodValidator(keyPathSchema, req.params);
    if (parsed_path.err) {
        return res.code(statusCode.BAD_REQUEST).headers({ "content-type": "application/problem+xml" }).send(buildXml(parsed_path.err));
    }

    try {
        const queriedKey = await database.get_sync('SELECT * FROM tb_Entries WHERE key = ?', [parsed_path.data?.key]);

        if (!queriedKey) return res.code(statusCode.NOT_FOUND).headers({
            "content-type": "application/problem+xml"
        }).send(errors.not_found());

        const queries_result: any[] = await Promise.allSettled([
            database.get_sync('SELECT * FROM tb_Accounts WHERE accountNumber = ?', [queriedKey.accountNumber]),
            database.get_sync('SELECT * FROM tb_Owners WHERE taxIdNumber = ?', [queriedKey.taxIdNumber]),
        ])

        var owner: any = {
            Type: queries_result[1].value.type,
            TaxIdNumber: queries_result[1].value.taxIdNumber,
            Name: queries_result[1].value.name
        };

        if(queries_result[1].value.type === "LEGAL_PERSON") owner[`TradeName`] = queries_result[1].value.tradeName;

        return res.code(statusCode.OK).headers({
            "content-type": "application/xml"
        }).send(buildXml({
            GetEntryResponse: {
                Signature: '',
                ResponseTime: new Date().toISOString(),
                CorrelationId: crypto.randomUUID(),
                Entry: {
                    Key: queriedKey.key,
                    KeyType: queriedKey.keyType,
                    Account: {
                        Participant: queries_result[0].value.participant,
                        Branch: queries_result[0].value.branch,
                        AccountNumber: queries_result[0].value.accountNumber,
                        AccountType: queries_result[0].value.accountType,
                        OpeningDate: queries_result[0].value.openingDate
                    },
                    Owner: owner
                }
            }
        }))
    } catch (e) {
        logger.error(e);
        return res.code(statusCode.SERVICE_UNAVAIBLE)
            .headers({ "content-type": "application/problem+xml" })
            .send(errors.service_unvaible());
    }
}