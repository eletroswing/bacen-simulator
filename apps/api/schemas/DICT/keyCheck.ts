import { z } from 'zod';

export default z.union([
	z.coerce.string().max(77),
	z.array(z.coerce.string().max(77)).max(200),
]);
