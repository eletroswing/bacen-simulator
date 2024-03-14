import { describe, expect, test } from '@jest/globals';
import orchestrator from '../../orchestrator';
import { XMLParser } from 'fast-xml-parser';

describe('Testing the "entries" get path', () => {
    test('Check key that dont exists', async () => {
        const fetchedData = await fetch(`${orchestrator.SERVER_URL}/dict/entries/${crypto.randomUUID()}`, { method: 'GET' })
        const parsed: any = new XMLParser().parse(await fetchedData.text());
        expect(fetchedData.headers.get('content-type')).toBe('application/problem+xml');
        expect(fetchedData.status).toBe(404);
        expect(parsed.problem.type).toBe('https://dict.pi.rsfn.net.br/api/v2/error/NotFound');
        expect(parsed.problem.title).toBe('Not found');
        expect(parsed.problem.status).toBe(404);
        expect(parsed.problem.detail).toBe('Entry associated with given key does not exist');
    });

    test('Check key that exists', async () => {
        const key = crypto.randomUUID();

        await fetch(`${orchestrator.SERVER_URL}/dict/entries`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/xml'
            },
            body: `<?xml version="1.0" encoding="UTF-8" ?>
      <CreateEntryRequest>
          <Signature></Signature>
          <Entry>
              <Key>${key}</Key>
              <KeyType>EVP</KeyType>
              <Account>
                  <Participant>09515813</Participant>
                  <Branch>0001</Branch>
                  <AccountNumber>45740085150077534000</AccountNumber>
                  <AccountType>CACC</AccountType>
                  <OpeningDate>2010-01-10T03:00:00Z</OpeningDate>
              </Account>
              <Owner>
                  <Type>NATURAL_PERSON</Type>
                  <TaxIdNumber>89055402842</TaxIdNumber>
                  <Name>Geraldo Pinho</Name>
              </Owner>
          </Entry>
          <Reason>USER_REQUESTED</Reason>
          <RequestId>a946d533-7f22-42a5-9a9b-e87cd55c0f4d</RequestId>
      </CreateEntryRequest>`
        })

        const fetchedData = await fetch(`${orchestrator.SERVER_URL}/dict/entries/${key}`, { method: 'GET' })

        expect(fetchedData.headers.get('content-type')).toBe('application/xml');
        expect(fetchedData.status).toBe(200);
    });
});