import { FastifyReply, FastifyRequest } from 'fastify';

import buildXml from '@api/util/buildXml';

export default (req: FastifyRequest<{
    Params: {
        key: string
    };
}>, res: FastifyReply) => {
    // Getting Key Param
    const key = req.params.key;

    // Checking if key exceeds 77 length max
    if(key.split("").length > 77) {
        return res.code(400).headers({
            "content-type": "text-xml"
        }).send(buildXml({
            problem: {
                "@xmlns": "urn:ietf:rfc:7807",
                type: "https://dict.pi.rsfn.net.br/api/v2/error/EntryInvalid",
                title: "Key param is invalid",
                status: 400,
                detail: "Key param exceeds the characters limit",
                violations: [
                    {
                        violation: {
                            reason: "Key param has more than 77 characters",
                            value: `${key || 'No key param detected'}`,
                            property: "param"
                        }
                    }
                ]
            }
        }))
    }
    res.code(200).send('Must get the key');
}