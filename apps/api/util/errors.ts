import buildXml from "./buildXml";

const service_unvaible = () => buildXml({
    problem: {
        "@xmlns": "urn:ietf:rfc:7807",
        type: "https://dict.pi.rsfn.net.br/api/v2/error/ServiceUnavailable",
        title: "Service Unavailable",
        status: 503,
        detail: "Service is under scheduled maintenance",
    }
})

const forbidden = () => buildXml({
    problem: {
        "@xmlns": "urn:ietf:rfc:7807",
        type: "https://dict.pi.rsfn.net.br/api/v2/error/Forbidden",
        title: "Forbidden",
        status: 403,
        detail: "Participant is not allowed to access this resource",
    }
})

export default Object.freeze({
    service_unvaible,
    forbidden,
})