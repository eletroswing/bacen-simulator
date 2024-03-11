import { z } from 'zod';

//TODO: detect if type is LEGAL_PERSON to require TradeName
export default z.object({
    Type: z.enum(['NATURAL_PERSON', 'LEGAL_PERSON']),
    TaxNumber: z.coerce.string().max(14),
    Name: z.coerce.string().max(120),
    TradeName: z.coerce.string().nullable(),
});