import buildXml from './buildXml';
import statusCode from './statusCode';

const service_unvaible = () =>
	buildXml({
		problem: {
			'@xmlns': 'urn:ietf:rfc:7807',
			type: 'https://dict.pi.rsfn.net.br/api/v2/error/ServiceUnavailable',
			title: 'Service Unavailable',
			status: statusCode.SERVICE_UNAVAIBLE,
			detail: 'Service is under scheduled maintenance',
		},
	});

const forbidden = () =>
	buildXml({
		problem: {
			'@xmlns': 'urn:ietf:rfc:7807',
			type: 'https://dict.pi.rsfn.net.br/api/v2/error/Forbidden',
			title: 'Forbidden',
			status: statusCode.FORBIDDEN,
			detail: 'Participant is not allowed to access this resource',
		},
	});

const not_found = () =>
	buildXml({
		problem: {
			'@xmlns': 'urn:ietf:rfc:7807',
			type: 'https://dict.pi.rsfn.net.br/api/v2/error/NotFound',
			title: 'Not found',
			status: statusCode.NOT_FOUND,
			detail: 'Entry associated with given key does not exist',
		},
	});

export default Object.freeze({
	service_unvaible,
	forbidden,
	not_found,
});
