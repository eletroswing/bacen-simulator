import type {
	FastifyInstance,
	FastifyReply,
	FastifyRequest,
	RegisterOptions,
} from 'fastify';

export default (
	instance: FastifyInstance,
	_opts: RegisterOptions,
	done: () => void,
) => {
	instance.post('/', (_req: FastifyRequest, res: FastifyReply) => {
		res.send('Create a new claim.');
	});
	instance.get('/', (_req: FastifyRequest, res: FastifyReply) => {
		res.send('Gets a list of claims, sorted in ascending order');
	});
	instance.get('/:id', (_req: FastifyRequest, res: FastifyReply) => {
		res.send('Gets details of a claim.');
	});
	instance.post(
		'/:id/acknowledge',
		(_req: FastifyRequest, res: FastifyReply) => {
			res.send(
				'Notifies receipt by the donor participant of a claim with OPEN status.',
			);
		},
	);
	instance.post('/:id/confirm', (_req: FastifyRequest, res: FastifyReply) => {
		res.send(
			'Confirms the claim operation. As a consequence, the keys link with the donating participant is removed.',
		);
	});
	instance.post('/:id/cancel', (_req: FastifyRequest, res: FastifyReply) => {
		res.send('Cancels a portability or ownership claim.');
	});
	instance.post('/:id/complete', (_req: FastifyRequest, res: FastifyReply) => {
		res.send(
			'Completes claim for claimant. As a consequence, the link between the key and the claiming participant is created.',
		);
	});
	done();
};
