import {describe, expect, test} from '@jest/globals';
import orchestrator from '../../orchestrator';

describe('Check  Tests on DICT ', () => {
  test('Check passing a valid body', async () => {
    const key = crypto.randomUUID()
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

    const fetchedData = await fetch(`${orchestrator.SERVER_URL}/dict/keys/check`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/xml'
      },
      body: `<?xml version="1.0" encoding="UTF-8" ?><CheckKeysRequest><Keys><Key>${key}</Key></Keys></CheckKeysRequest>`
    })

    expect(fetchedData.headers.get('content-type')).toBe('application/xml');
    expect(fetchedData.status).toBe(200);
    expect(await fetchedData.text()).toBe(`<?xml version="1.0" encode="UTF-8" standalone="yes"?><CheckKeysRequest><Keys><Key hasEntry>${key}</Key></Keys></CheckKeysRequest>`);
  });

  test('Check passing a valid body and key that dont exists', async () => {
    const key = crypto.randomUUID()

    const fetchedData = await fetch(`${orchestrator.SERVER_URL}/dict/keys/check`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/xml'
      },
      body: `<?xml version="1.0" encoding="UTF-8" ?><CheckKeysRequest><Keys><Key>${key}</Key></Keys></CheckKeysRequest>`
    })

    expect(fetchedData.headers.get('content-type')).toBe('application/xml');
    expect(fetchedData.status).toBe(200);
    expect(await fetchedData.text()).toBe(`<?xml version="1.0" encode="UTF-8" standalone="yes"?><CheckKeysRequest><Keys><Key hasEntry="false">${key}</Key></Keys></CheckKeysRequest>`);
 
  });

  test('Check passing a valid body', async () => {
    const key = crypto.randomUUID()
    const key2 = crypto.randomUUID()

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

    const fetchedData = await fetch(`${orchestrator.SERVER_URL}/dict/keys/check`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/xml'
      },
      body: `<?xml version="1.0" encoding="UTF-8" ?><CheckKeysRequest><Keys><Key>${key}</Key><Key>${key2}</Key></Keys></CheckKeysRequest>`
    })

    expect(fetchedData.headers.get('content-type')).toBe('application/xml');
    expect(fetchedData.status).toBe(200);
    expect(await fetchedData.text()).toBe(`<?xml version="1.0" encode="UTF-8" standalone="yes"?><CheckKeysRequest><Keys><Key hasEntry>${key}</Key><Key hasEntry="false">${key2}</Key></Keys></CheckKeysRequest>`);
  });

});