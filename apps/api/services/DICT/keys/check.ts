import { FastifyReply, FastifyRequest } from 'fastify';
import { z } from 'zod';

import buildXml from '@api/util/buildXml';
import zodValidator from '@api/util/zodValidator';
import CheckKeysRequest from '@api/schemas/DICT/checkKeysRequest';

import database from '@repo/infra/database';
import errors from '@api/util/errors';
import logger from '@repo/infra/logger';

export default async (req: FastifyRequest, res: FastifyReply) => {
    const parsed_body: { err: unknown | null, data: z.infer<typeof CheckKeysRequest> | null } = zodValidator(CheckKeysRequest)(req);
    if (parsed_body.err) {
        return res.code(400).headers({ "content-type": "application/problem+xml" }).send(buildXml(parsed_body.err));
    };

    var query = `SELECT * FROM 'keys' WHERE key = '' `;
    const params: string[] = [];

    if (typeof parsed_body.data?.CheckKeysRequest.Keys.Key == 'object') {
        parsed_body.data?.CheckKeysRequest.Keys.Key.forEach((key) => {
            query = `${query} OR key = ?`;
            params.push(`${key}`);
        });
    } else {
        query = `${query} OR key = ?`;
        params.push(`${parsed_body.data?.CheckKeysRequest.Keys.Key}`);
    }

    const data_query = await database.get_multiple_sync(query, params);

    const keys = [];

    function KeyOnResponse(key: any, response: any[]) {
        return response.filter(item => item.key == key).length > 0
    }

    if (typeof parsed_body.data?.CheckKeysRequest.Keys.Key == 'object') {
        parsed_body.data?.CheckKeysRequest.Keys.Key.forEach((key) => {
            keys.push({
                "@hasEntry": `${KeyOnResponse(`${key}`, data_query)}`,
                "#text": `${key}`
            })
        });
    } else {
        keys.push({
            "@hasEntry": `${KeyOnResponse(`${parsed_body.data?.CheckKeysRequest.Keys.Key}`, data_query)}`,
            "#text": `${parsed_body.data?.CheckKeysRequest.Keys.Key}`
        })
    }

    const response_json = {
        CheckKeysRequest: {
            Keys: {
                Key: keys
            }
        }
    }

    try {
        return res.code(200).headers({
            "content-type": "application/xml"
        }).send(buildXml(response_json));
    } catch (e: unknown) {
        logger.warn(e);
        return res.code(503).headers({
            "content-type": "application/problem+xml"
        }).send(errors.service_unvaible());
    }
}