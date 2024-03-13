import { FastifyRequest } from "fastify";
import z, { Schema } from "zod";

function parse(schema: Schema): Function {
  return (req: FastifyRequest, isReq: boolean): { err: unknown | null, data: z.infer<typeof schema> | null } => {
    if(!isReq) {
      const parsed = schema.safeParse(req);
      
      if (parsed.success) {
        return { err: null, data: req };
      }
  
      const json_err = JSON.parse(parsed.error.message);
  
      let value: any = req;
      for (let i = 0; i < json_err[0].path.length; i++) {
        value = value[json_err[0].path[i]]
      };
  
      return {
        err: {
          problem: {
            "@xmlns": "urn:ietf:rfc:7807",
            type: "https://dict.pi.rsfn.net.br/api/v2/error/EntryInvalid",
            title: "Entry is invalid",
            status: 400,
            detail: "Entry has invalid paths",
            violations: [
              {
                violation: {
                  reason: json_err[0].message.replace(/'/g, ``),
                  value: value || "Missing value",
                  property: json_err[0].path.join('.'),
                }
              }
            ]
          }
        }, data: null
      }
    }

    const condition = !["text/xml", "application/xml", "application/rss+xml"].includes(req.headers['content-type'] as string);
    if (condition) {
      return {
        err: {
          problem: {
            "@xmlns": "urn:ietf:rfc:7807",
            type: "https://dict.pi.rsfn.net.br/api/v2/error/EntryInvalid",
            title: "Entry is invalid",
            status: 400,
            detail: "Entry has invalid fields",
            violations: [
              {
                violation: {
                  reason: "Entry has invalid body",
                  value: `${req.body || 'No body detected'}`,
                  property: "entry"
                }
              }
            ]
          }
        }, data: null
      }
    }

    const parsed: any = schema.safeParse(req.body);
    if (parsed.success) {
      return { err: null, data: req.body };
    }

    const json_err = JSON.parse(parsed.error.message);

    let value: any = req.body;
    for (let i = 0; i < json_err[0].path.length; i++) {
      value = value[json_err[0].path[i]]
    };

    return {
      err: {
        problem: {
          "@xmlns": "urn:ietf:rfc:7807",
          type: "https://dict.pi.rsfn.net.br/api/v2/error/EntryInvalid",
          title: "Entry is invalid",
          status: 400,
          detail: "Entry has invalid fields",
          violations: [
            {
              violation: {
                reason: json_err[0].message.replace(/'/g, ``),
                value: value || "Missing value",
                property: json_err[0].path.join('.'),
              }
            }
          ]
        }
      }, data: null
    }
  }
}

export default parse;