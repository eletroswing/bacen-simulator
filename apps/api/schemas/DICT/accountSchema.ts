import { z } from 'zod';

export default z.object({
    Participant: z.coerce.string().max(8).regex(/^[0-9]{8}$/, { message: "Value does not match regex \'/^[0-9]{8}$/\'" }),
    Branch: z.coerce.string().max(4).regex(/^[0-9]{1,4}$/, { message: "Value does not match regex \'/^[0-9]{1,4}$/\'" }),
    AccountNumber: z.coerce.string().max(20).regex(/^[0-9]{1,20}$/, { message: "Value does not match regex \'/^[0-9]{1,20}$/\'" }),
    AccountType: z.enum(['CACC','TRAN','SLRY','SVGS']),
    OpeningDate: z.coerce.string().regex(/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z/, { message: "Date must be in format: 2010-01-10T03:00:00.00Z" })
});