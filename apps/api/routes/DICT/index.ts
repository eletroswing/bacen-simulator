
import { FastifyInstance, RegisterOptions } from 'fastify';

import EntriesRouter from '@api/routes/DICT/entries';
import ClaimRouter from '@api/routes/DICT/claim';
import RefundsRouter from '@api/routes/DICT/refunds';

export default (instance: FastifyInstance, _opts: RegisterOptions, done: Function) => {
    instance.register(EntriesRouter, { prefix: 'entries' });  //at https://www.bcb.gov.br/content/estabilidadefinanceira/pix/API-DICT-2.0.1.html#tag/Refund
    instance.register(ClaimRouter, { prefix: 'claims' });     //at https://www.bcb.gov.br/content/estabilidadefinanceira/pix/API-DICT-2.0.1.html#tag/Claim
    instance.register(RefundsRouter, { prefix: 'refunds' });  //at https://www.bcb.gov.br/content/estabilidadefinanceira/pix/API-DICT-2.0.1.html#tag/Refund
    done();
}