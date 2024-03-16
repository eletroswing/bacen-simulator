import { z } from 'zod';

const ParticipantRegex = /^[0-9]{8}$/;
const BranchRegex = /^[0-9]{1,4}$/;
const AccountNumberRegex = /^[0-9]{1,20}$/;
const IsoDateRegex = /\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{2,3}Z/;

export default z.object({
	Participant: z.coerce
		.string()
		.max(8)
		.regex(ParticipantRegex, {
			message: `Value does not match regex \'${ParticipantRegex}\'`,
		}),
	Branch: z.coerce
		.string()
		.max(4)
		.regex(BranchRegex, {
			message: `Value does not match regex \'${BranchRegex}\'`,
		}),
	AccountNumber: z.coerce
		.string()
		.max(20)
		.regex(AccountNumberRegex, {
			message: `Value does not match regex \'${AccountNumberRegex}\'`,
		}),
	AccountType: z.enum(['CACC', 'TRAN', 'SLRY', 'SVGS']),
	OpeningDate: z.coerce.string().regex(IsoDateRegex, {
		message: 'Date must be in format: ±YYYY-MM-DDTHH:mm:ss.sssZ',
	}),
});
