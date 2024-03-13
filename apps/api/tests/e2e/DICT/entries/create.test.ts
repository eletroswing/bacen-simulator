import {describe, expect, test} from '@jest/globals';
import orchestrator from '../../orchestrator';
import { XMLParser } from 'fast-xml-parser';

describe('Create Entry Tests on DICT ', () => {
  test('Create passing a valid body', async () => {
    const fetchedData = await fetch(`${orchestrator.SERVER_URL}/dict/entries`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/xml'
      },
      body: `<?xml version="1.0" encoding="UTF-8" ?>
<CreateEntryRequest>
    <Signature></Signature>
    <Entry>
        <Key>${crypto.randomUUID()}</Key>
        <KeyType>EVP</KeyType>
        <Account>
            <Participant>24313102</Participant>
            <Branch>0000</Branch>
            <AccountNumber>0000000000</AccountNumber>
            <AccountType>CACC</AccountType>
            <OpeningDate>2010-01-10T03:00:00Z</OpeningDate>
        </Account>
        <Owner>
            <Type>NATURAL_PERSON</Type>
            <TaxIdNumber>11122233300</TaxIdNumber>
            <Name>João Silva</Name>
        </Owner>
    </Entry>
    <Reason>USER_REQUESTED</Reason>
    <RequestId>a946d533-7f22-42a5-9a9b-e87cd55c0f4d</RequestId>
</CreateEntryRequest>`
    })

    expect(fetchedData.headers.get('content-type')).toBe('application/xml');
    expect(fetchedData.status).toBe(201);
  });

  test('Create with an existing key', async () => {
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
            <Participant>24313102</Participant>
            <Branch>0000</Branch>
            <AccountNumber>0000000000</AccountNumber>
            <AccountType>CACC</AccountType>
            <OpeningDate>2010-01-10T03:00:00Z</OpeningDate>
        </Account>
        <Owner>
            <Type>NATURAL_PERSON</Type>
            <TaxIdNumber>11122233300</TaxIdNumber>
            <Name>João Silva</Name>
        </Owner>
    </Entry>
    <Reason>USER_REQUESTED</Reason>
    <RequestId>a946d533-7f22-42a5-9a9b-e87cd55c0f4d</RequestId>
</CreateEntryRequest>`
    })

    const fetchedData = await fetch(`${orchestrator.SERVER_URL}/dict/entries`, {
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
            <Participant>24313102</Participant>
            <Branch>0000</Branch>
            <AccountNumber>0000000000</AccountNumber>
            <AccountType>CACC</AccountType>
            <OpeningDate>2010-01-10T03:00:00Z</OpeningDate>
        </Account>
        <Owner>
            <Type>NATURAL_PERSON</Type>
            <TaxIdNumber>11122233300</TaxIdNumber>
            <Name>João Silva</Name>
        </Owner>
    </Entry>
    <Reason>USER_REQUESTED</Reason>
    <RequestId>a946d533-7f22-42a5-9a9b-e87cd55c0f4d</RequestId>
</CreateEntryRequest>`
    })

    expect(fetchedData.headers.get('content-type')).toBe('application/problem+xml');
    expect(fetchedData.status).toBe(403);
  });

  test('Create without passing a body', async () => {
    const fetchedData = await fetch(`${orchestrator.SERVER_URL}/dict/entries`, {
      method: 'POST',
    })

    const body = new XMLParser().parse(await fetchedData.text());
    expect(fetchedData.headers.get('content-type')).toBe('application/problem+xml');
    expect(fetchedData.status).toBe(400);
    expect(body['?xml']).toBe('');
    expect(body.problem.type).toBe('https://dict.pi.rsfn.net.br/api/v2/error/EntryInvalid');
    expect(body.problem.title).toBe('Entry is invalid');
    expect(body.problem.status).toBe(400);
    expect(body.problem.detail).toBe('Entry has invalid fields');
    expect(body.problem.violations.violation.reason).toBe('Entry has invalid body');
    expect(body.problem.violations.violation.value).toBe('No body detected');
    expect(body.problem.violations.violation.property).toBe('entry');
  });

  test('Create passing a body with invalid fields when owner is NATURAL_PERSON', async () => {
    const fetchedData = await fetch(`${orchestrator.SERVER_URL}/dict/entries`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/xml'
      },
      body: `<?xml version="1.0" encoding="UTF-8" ?>
<CreateEntryRequest>
    <Signature></Signature>
    <Entry>
        <Key>+5561988880000</Key>
        <KeyType>PHONE</KeyType>
        <Account>
            <Participant>24313102</Participant>
            <Branch>0000</Branch>
            <AccountNumber>0007654321</AccountNumber>
            <AccountType>CACC</AccountType>
            <OpeningDate>2010-01-10T03:00:00Z</OpeningDate>
        </Account>
        <Owner>
            <Type>NATURAL_PERSON</Type>
            <TaxIdNumber>11122233300</TaxIdNumber>
            <Name>João Silva</Name>
            <TradeName>Some nme</TradeName>
        </Owner>
    </Entry>
    <Reason>USER_REQUESTED</Reason>
    <RequestId>a946d533-7f22-42a5-9a9b-e87cd55c0f4d</RequestId>
</CreateEntryRequest>`
    })

    const body = new XMLParser().parse(await fetchedData.text());
    expect(fetchedData.headers.get('content-type')).toBe('application/problem+xml');
    expect(fetchedData.status).toBe(400);
    expect(body['?xml']).toBe('');
    expect(body.problem.type).toBe('https://dict.pi.rsfn.net.br/api/v2/error/EntryInvalid');
    expect(body.problem.title).toBe('Entry is invalid');
    expect(body.problem.status).toBe(400);
    expect(body.problem.detail).toBe('Entry has invalid fields');

    expect(body.problem.violations.violation.reason).toBe('TradeName is not required when Type is equal to NATURAL_PERSON.');
    expect(body.problem.violations.violation.value).toBe('Some nme');
    expect(body.problem.violations.violation.property).toBe('CreateEntryRequest.Entry.Owner.TradeName');
  });

  test('Create passing a body with invalid fields when owner is LEGAL_PERSON', async () => {
    const fetchedData = await fetch(`${orchestrator.SERVER_URL}/dict/entries`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/xml'
      },
      body: `<?xml version="1.0" encoding="UTF-8" ?>
<CreateEntryRequest>
    <Signature></Signature>
    <Entry>
        <Key>_erro_é_ki</Key>
        <KeyType>EVP</KeyType>
        <Account>
            <Participant>12345678</Participant>
            <Branch>0001</Branch>
            <AccountNumber>0007654321</AccountNumber>
            <AccountType>CACC</AccountType>
            <OpeningDate>2010-01-10T03:00:00Z</OpeningDate>
        </Account>
        <Owner>
            <Type>LEGAL_PERSON</Type>
            <TaxIdNumber>11122233300</TaxIdNumber>
            <Name>João Silva</Name>
        </Owner>
    </Entry>
    <Reason>USER_REQUESTED</Reason>
    <RequestId>a946d533-7f22-42a5-9a9b-e87cd55c0f4d</RequestId>
</CreateEntryRequest>`
    })

    const body = new XMLParser().parse(await fetchedData.text());
    expect(fetchedData.headers.get('content-type')).toBe('application/problem+xml');
    expect(fetchedData.status).toBe(400);
    expect(body['?xml']).toBe('');
    expect(body.problem.type).toBe('https://dict.pi.rsfn.net.br/api/v2/error/EntryInvalid');
    expect(body.problem.title).toBe('Entry is invalid');
    expect(body.problem.status).toBe(400);
    expect(body.problem.detail).toBe('Entry has invalid fields');

    expect(body.problem.violations.violation.reason).toBe('TradeName is required when Type is equal to LEGAL_PERSON.');
    expect(body.problem.violations.violation.value).toBe('Missing value');
    expect(body.problem.violations.violation.property).toBe('CreateEntryRequest.Entry.Owner.TradeName');
  });
});