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
		res.send(
			'Creates a return request.Only the debited participant can create a refund request.',
		);
	});
	instance.get('/', (_req: FastifyRequest, res: FastifyReply) => {
		res.send(
			'Gets list of return requests to which the participant is a party.',
		);
	});
	instance.get('/:id', (_req: FastifyRequest, res: FastifyReply) => {
		res.send('Gets details of a return request.');
	});
	instance.post('/:id/cancel', (_req: FastifyRequest, res: FastifyReply) => {
		res.send('Cancela a Solicitação de devolução.');
	});
	instance.post('/:id/close', (_req: FastifyRequest, res: FastifyReply) => {
		res.send(
			'Close the return request.The request can only be closed by the challenged participant.',
		);
	});
	done();
};
