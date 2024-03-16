import { z } from 'zod';

export default z.object({
	key: z.coerce
		.string({ required_error: 'Key path is required to this route.' })
		.max(77),
});
