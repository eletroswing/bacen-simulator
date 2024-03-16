import { XMLBuilder } from 'fast-xml-parser';
import type { RecursiveRecord } from '@api/types/recursiveRecord';

export default (obj: RecursiveRecord) => {
	let newObj: RecursiveRecord = {};
	if (!obj['?xml'])
		newObj = {
			'?xml': {
				'@version': '1.0',
				'@encode': 'UTF-8',
				'@standalone': 'yes',
			},
			...obj,
		};

	const builder = new XMLBuilder({
		attributeNamePrefix: '@',
		ignoreAttributes: false,
		suppressBooleanAttributes: false,
	});

	return builder.build(newObj);
};
