import { XMLParser, XMLValidator } from 'fast-xml-parser';
import { FastifyInstance } from 'fastify';
import FastifyPlugin from 'fastify-plugin';

const defaults = {
    contentType: ["text/xml", "application/xml", "application/rss+xml"]
}

function xmlBodyParserPlugin(validate: boolean = true) {
    function execute(fastify: FastifyInstance, options: any, next: Function) {
        const opts = Object.assign({}, defaults, options || {})
        function contentParser(req: any, payload: any, done: Function) {
            const xmlParser = new XMLParser();
            const parsingOpts = opts;

            let body = ''
            payload.on('error', errorListener)
            payload.on('data', dataListener)
            payload.on('end', endListener)

            function errorListener(err: Error) {
                done(err)
            }

            function endListener() {
                if (!validate) {
                    return handleParseXml(body);
                }

                const result: any = XMLValidator.validate(body, parsingOpts);
                if (result.err) {
                    const invalidFormat: any = new Error('Invalid Format: ' + result.err.msg);
                    invalidFormat.statusCode = 400;
                    payload.removeListener('error', errorListener);
                    payload.removeListener('data', dataListener);
                    payload.removeListener('end', endListener);
                    done(invalidFormat);
                    return
                }

                return handleParseXml(body);
            }

            function dataListener(data: any) {
                body = body + data;
            }

            function handleParseXml(body: string) {
                try {
                    done(null, xmlParser.parse(body));
                } catch (err) {
                    done(err);
                }
            }
        }

        if (typeof opts.contentType === "string") {
            fastify.addContentTypeParser(opts.contentType, contentParser);
        } else {
            for (var i = 0; i < opts.contentType.length; i++) {
                fastify.addContentTypeParser(opts.contentType[i], contentParser);
            }
        }

        next();
    }

    return FastifyPlugin(execute, {
        name: 'xml-body-parser'
    });
}

export default xmlBodyParserPlugin;