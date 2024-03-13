import { z } from 'zod';

export default z.object({
    key: z.coerce.string().max(77)
})