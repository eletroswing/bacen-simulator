import { describe, expect, test } from '@jest/globals';
import orchestrator from '../../orchestrator';
import { XMLParser } from 'fast-xml-parser';

describe('Testing the "entries" get path', () => {
    test('Update key that dont exists', async () => {
        const fetchedData = await fetch(`${orchestrator.SERVER_URL}/dict/entries/${crypto.randomUUID()}`, { method: 'GET' })
        const parsed: any = new XMLParser().parse(await fetchedData.text());
        expect(fetchedData.headers.get('content-type')).toBe('application/problem+xml');
        expect(fetchedData.status).toBe(404);
        expect(parsed.problem.type).toBe('https://dict.pi.rsfn.net.br/api/v2/error/NotFound');
        expect(parsed.problem.title).toBe('Not found');
        expect(parsed.problem.status).toBe(404);
        expect(parsed.problem.detail).toBe('Entry associated with given key does not exist');
    });
});