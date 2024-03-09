import { z } from 'zod';

export default z.object({
    Participant: z.coerce.string().max(8),
    Branch: z.coerce.string().max(4),
    AccountNumber: z.coerce.string().max(20),
    AccountType: z.enum(['CACC','TRAN','SLRY','SVGS']),
    OpeningDate: z.coerce.string()
});