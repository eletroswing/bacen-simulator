import type { FastifyReply, FastifyRequest } from 'fastify';
import type { z } from 'zod';

import zodValidator from '@api/util/zodValidator';

import buildXml from '@api/util/buildXml';
import errors from '@api/util/errors';
import statusCode from '@api/util/statusCode';
import database from '@repo/infra/database';
import logger from '@repo/infra/logger';

import type { RecursiveRecord } from '@api/types/recursiveRecord';
import deleteKeySchema from '@api/schemas/DICT/deleteKeySchema';

type PromiseResponse = { value: RecursiveRecord };

export default async (
    req: FastifyRequest<{
        Params: {
            key: string;
        };
    }>,
    res: FastifyReply,
) => {

    const { body: bd }: { body: unknown } = req;
    const body = {
        ...(bd as object),
        key: req.params.key,
    };

    const parsed_body: {
        err: unknown | null;
        data: z.infer<typeof deleteKeySchema> | null;
    } = zodValidator(deleteKeySchema, body);
    if (parsed_body.err || !parsed_body.data) {
        return res
            .code(statusCode.BAD_REQUEST)
            .headers({ 'content-type': 'application/problem+xml' })
            .send(buildXml(parsed_body.err as RecursiveRecord));
    }

    try {
        const {
            key,
            DeleteEntryRequest: { Signature, Key, Participant, Reason },
        }: z.infer<typeof deleteKeySchema> = parsed_body.data;

        const queriedKey = await database.get_sync(
            'SELECT * FROM tb_Entries WHERE key = ?',
            [key],
        );

        if (!queriedKey)
            return res
                .code(statusCode.NOT_FOUND)
                .headers({
                    'content-type': 'application/problem+xml',
                })
                .send(errors.not_found());

        const queriedParticipant = await database.get_sync(
            'SELECT * FROM tb_Accounts WHERE accountNumber = ?',
            [queriedKey.accountNumber],
        );

        if (queriedParticipant.participant !== Participant || !queriedParticipant)
            return res
                .code(statusCode.FORBIDDEN)
                .headers({
                    'content-type': 'application/problem+xml',
                })
                .send(errors.forbidden());

        await database.run_sync('DELETE FROM tb_Entries WHERE key = ?', [key])

        return res
            .code(statusCode.OK)
            .headers({
                'content-type': 'application/xml',
            })
            .send(
                buildXml({
                    DeleteEntryResponse: {
                        Signature: '',
                        ResponseTime: new Date().toISOString(),
                        CorrelationId: crypto.randomUUID(),
                        Key: Key
                    },
                }),
            );
    } catch (e) {
        logger.error(e);
        return res
            .code(statusCode.SERVICE_UNAVAIBLE)
            .headers({ 'content-type': 'application/problem+xml' })
            .send(errors.service_unvaible());
    }
};
