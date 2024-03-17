import { z } from 'zod';

const ParticipantRegex = /^[0-9]{8}$/;

export default z.object({
	key: z.coerce
		.string({ required_error: 'Key path is required to this route.' })
		.max(77),
		DeleteEntryRequest: z.object({
		Signature: z.any({
			required_error: 'Signature is required to this route.',
		}),
		Key: z.coerce
			.string({ required_error: 'Key is required to this route.' })
			.max(77),
		Participant: z.coerce
			.string()
			.max(8)
			.regex(ParticipantRegex, {
				message: `Value does not match regex \'${ParticipantRegex}\'`,
			}),
		Reason: z.enum(["USER_REQUESTED","ACCOUNT_CLOSURE","BRANCH_TRANSFER","RECONCILIATION","FRAUD"], {
			required_error: 'Reason is required to this route.',
			invalid_type_error:
				"Reason must be \"USER_REQUESTED\",\"ACCOUNT_CLOSURE\",\"BRANCH_TRANSFER\",\"RECONCILIATION\" or \"FRAUD\".",
		}),
	}),
});
