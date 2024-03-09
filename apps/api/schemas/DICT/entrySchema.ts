import { z } from 'zod';
import accountSchema from './accountSchema';
import ownerSchema from './ownerSchema';

export default  z.object({
    Key: z.coerce.string().max(77),
    KeyType: z.enum(['CPF','CNPJ','EMAIL','PHONE','EVP']),
    Account: accountSchema,
    Owner: ownerSchema
});