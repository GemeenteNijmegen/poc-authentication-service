import { authenticateRequest, tokenResponse } from '../token.lambda';

test('Authentication using basic auth', async () => {
  const credentials = Buffer.from('abcdef:geheim', 'utf-8').toString('base64');
  const header = `Basic ${credentials}`;

  expect(authenticateRequest({
    headers: {
      Authorization: header,
    },
    body: 'abc=def',
  } as any)).toBe('abcdef');
});

test('Authentication no body', async () => {
  const credentials = Buffer.from('abcdef:geheim', 'utf-8').toString('base64');
  const header = `Basic ${credentials}`;

  expect(authenticateRequest({
    headers: {
      Authorization: header,
    },
  } as any)).toBe('abcdef');
});

test('Authentication in body', async () => {
  expect(authenticateRequest({
    body: 'client_id=abcdef&client_secret=geheim',
  } as any)).toBe('abcdef');
});

test('Authentication using basic auth and body', async () => {
  const credentials = Buffer.from('abcdef:geheim', 'utf-8').toString('base64');
  const header = `Basic ${credentials}`;

  expect(authenticateRequest({
    headers: {
      Authorization: header,
    },
    body: 'client_id=abcdef&client_secret=geheim',
  } as any)).toBe('abcdef');
});


test('token response', async () => {
  await tokenResponse(['test', 'abc'], 'abcdef');
});


// test('Token validation', async () => {

//   const issuer = 'https://aysy4jy713.execute-api.eu-central-1.amazonaws.com/prod/oauth';
//   const token = 'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJhdWQiOiJhYmNkZWYiLCJpc3MiOiJodHRwczovLzBxMjdldDViNDguZXhlY3V0ZS1hcGkuZXUtY2VudHJhbC0xLmFtYXpvbmF3cy5jb20vcHJvZC9vYXV0aCIsImlhdCI6MTcxNzc0NzIwNS4wMjEsImV4cCI6MTcxNzc1MDgwNS4wMjEsInN1YiI6ImFiY2RlZiIsInNjb3BlIjoidGVzdCJ9.AgoteaY6ulqXQFGAaIHShjQiUjqZgv_XSDNUBHuKZ_uDHqP-ukO3eeCQW6qejjpH4ZQrHc3-WyEYmdvwkZ9cvLQgQqZdw_vlSh3lFF4NVAmDWGp4vF4tx7jwdD3SVnMthI2SJQ-JxLKilRfN-XUiM1maacNo6Nnyp7B9e9DX0HRBfRoko2lQpFAw4SB_VGeRiSIzUdorVJDt2W_MNmUjankAetuRRC56rGJercdFbdshFNp2T2FeKPpNefrsli2yiuKtv5ZvxTPcm41YWmb-Ok0-gU1Hi_sNrw0umbC7grhZ_2_PfVj1dgJfYu_3cLNCOdceb3L2DWubKzzpLAhCYw';
//   const jwks = jose.createRemoteJWKSet(new URL(`${issuer}/.well-known/jwks.json`));
//   const result = await jose.jwtVerify(token, jwks, {
//     issuer: issuer,
//   });

//   console.log(result);

// });
