import { z } from "zod";
import AccountSchema from '@api/schemas/DICT/accountSchema';
import OwnerSchema from '@api/schemas/DICT/ownerSchema';

export default z.object({
    key: z.coerce.string({required_error: 'Key path is required to this route.'}).max(77),
    UpdateEntryRequest: z.object({
        Signature: z.any({required_error: 'Signature is required to this route.'}),
        Key: z.coerce.string({required_error: 'Key is required to this route.'}).max(77),
        Account: AccountSchema,
        Owner: OwnerSchema,
        Reason: z.enum(['USER_REQUESTED', 'BRANCH_TRANSFER', 'RECONCILIATION'], { required_error: 'Reason is required to this route.', invalid_type_error: "Reason must be `USER_REQUESTED`, 'BRANCH_TRANSFER' or `RECONCILIATION`" }),
    })
})