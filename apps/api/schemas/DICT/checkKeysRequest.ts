import { z } from 'zod'
import keySchema from './keyCheck';

export default z.object({
    CheckKeysRequest: z.object({
        Keys: z.object({
            Key: keySchema
        })
    })
});;