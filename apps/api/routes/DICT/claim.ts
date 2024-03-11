import { FastifyInstance, RegisterOptions } from 'fastify';

export default (instance: FastifyInstance, _opts: RegisterOptions, done: Function) => {
    instance.post('/',                (req: any, res: any) => { res.send('Create a new claim.') });
    instance.get('/',                 (req: any, res: any) => { res.send('Gets a list of claims, sorted in ascending order') });
    instance.get('/:id',              (req: any, res: any) => { res.send('Gets details of a claim.') });
    instance.post('/:id/acknowledge', (req: any, res: any) => { res.send('Notifies receipt by the donor participant of a claim with OPEN status.') });
    instance.post('/:id/confirm',     (req: any, res: any) => { res.send('Confirms the claim operation. As a consequence, the keys link with the donating participant is removed.') });
    instance.post('/:id/cancel',      (req: any, res: any) => { res.send('Cancels a portability or ownership claim.') });
    instance.post('/:id/complete',    (req: any, res: any) => { res.send('Completes claim for claimant. As a consequence, the link between the key and the claiming participant is created.') });
    done();
}