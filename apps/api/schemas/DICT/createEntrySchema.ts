import { z } from 'zod';
import entrySchema from './entrySchema';

export default z.object({
    CreateEntryRequest: z.object({
        Reason: z.enum(['USER_REQUESTED', 'RECONCILIATION'], { required_error: 'Reason is required to this route.', invalid_type_error: "Reason must be `USER_REQUESTED` or `RECONCILIATION`" }),
        RequestId: z.coerce.string({ required_error: 'RequestId is required to this route.' }).uuid('RequestId must be UUID v4'),
        Signature: z.any({required_error: 'Signature is required to this route.'}),
        Entry: entrySchema
    })
});;