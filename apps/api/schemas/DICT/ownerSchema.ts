import { z } from 'zod';

export default z.object({
    Type: z.enum(['NATURAL_PERSON', 'LEGAL_PERSON']),
    TaxIdNumber: z.coerce.string().max(14),
    Name: z.coerce.string().max(120),
    TradeName: z.coerce.string().nullable(),
})
.refine((data) => {
    if (data.Type == 'NATURAL_PERSON' && data.TradeName != 'undefined') return undefined;
    return true;
}, {
    message: 'TradeName is not required when Type is equal to NATURAL_PERSON.',
    path: ['TradeName']
})
.refine((data) => {
    if (data.Type == 'LEGAL_PERSON' && data.TradeName == 'undefined') return undefined;
    return true;
}, {
    message: 'TradeName is required when Type is equal to LEGAL_PERSON.',
    path: ['TradeName']
})
.refine((data) => {
    if (data.Type == 'NATURAL_PERSON' && !/^[0-9]{11}$/.test(data.TaxIdNumber)) return undefined;
    return true;
}, {
    message: 'Value does not match regex \'/^[0-9]{11}$/\'',
    path: ['TaxIdNumber']
})
.refine((data) => {
    if (data.Type == 'LEGAL_PERSON' && !/^[0-9]{14}$/.test(data.TaxIdNumber)) return undefined;
    return true;
}, {
    message: 'Value does not match regex \'/^[0-9]{14}$/\'',
    path: ['TaxIdNumber']
})
.refine((data) => {
    if (data.Type == 'NATURAL_PERSON' && !/^([A-Za-zÀ-ÖØ-öø-ÿ' -]+)$/.test(data.Name)) return undefined;
    return true;
}, {
    message: 'Value does not match regex \'/^([A-Za-zÀ-ÖØ-öø-ÿ\' -]+)$/\'',
    path: ['Name']
})
.refine((data) => {
    if (data.Type == 'LEGAL_PERSON' && !/^([A-Za-zÀ-ÖØ-öø-ÿ,.@:&*+_<>()!?/\\$%\d' -]+)$/.test(data.TaxIdNumber)) return undefined;
    return true;
}, {
    message: 'Value does not match regex \'/^([A-Za-zÀ-ÖØ-öø-ÿ,.@:&*+_<>()!?/\\$%\d\' -]+)$/\'',
    path: ['Name']
});
