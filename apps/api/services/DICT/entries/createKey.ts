import { FastifyReply, FastifyRequest } from 'fastify';
import { z } from 'zod';

import buildXml from '@api/util/buildXml';
import zodValidator from '@api/util/zodValidator';
import createEntrySchema from '@api/schemas/DICT/createEntrySchema';

export default (req: FastifyRequest, res: FastifyReply) => {
    if (!["text/xml", "application/xml", "application/rss+xml"].includes(req.headers['content-type'] as string)) {
        return res.code(400).headers({
            "content-type": "text/xml"
        }).send(buildXml({
            problem: {
                "@xmlns": "urn:ietf:rfc:7807",
                type: "https://dict.pi.rsfn.net.br/api/v2/error/EntryInvalid",
                title: "Entry is invalid",
                status: 400,
                detail: "Entry has invalid fields",
                violations: [
                    {
                        violation: {
                            reason: "Entry has invalid body'",
                            value: `${req.body || 'No body detected'}`,
                            property: "entry"
                        }
                    }
                ]
            }
        }))
    }

    const parsed_body: { err: unknown | null, data: z.infer<typeof createEntrySchema> | null } = zodValidator(createEntrySchema)(req.body);
    if (parsed_body.err) {
        return res.code(400).headers({"content-type": "text/xml"}).send(buildXml(parsed_body.err));
    };

    res.code(200).send("Must create the key")
}