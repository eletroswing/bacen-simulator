import { XMLBuilder } from 'fast-xml-parser';

export default (obj: any) => {
    if (!obj["?xml"]) obj = {
        "?xml": {
            "@version": "1.0",
            "@encode": "UTF-8",
            "@standalone": "yes",
        }, ...obj
    };

    const builder = new XMLBuilder({
        attributeNamePrefix: "@",
        ignoreAttributes: false,
    });

    return builder.build(obj);
}