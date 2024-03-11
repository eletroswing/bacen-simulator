import z, { Schema } from "zod";

function parse(schema: Schema): Function {
  return (data: any): { err: unknown | null, data: z.infer<typeof schema> | null } => {
    const parsed:any  = schema.safeParse(data);
    if (parsed.success) {
      return { err: null, data: data };
    }

    const json_err = JSON.parse(parsed.error.message);

    let value = data;
    for(let i = 0; i < json_err[0].path.length; i++) {
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
                value: value,
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