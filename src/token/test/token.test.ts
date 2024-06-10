import { AWS } from '@gemeentenijmegen/utils';
import { authenticateRequest } from '../token.lambda';

jest.spyOn(AWS, 'getSecret').mockResolvedValue(
  'abc',
);


beforeAll(() => {
  process.env.PRIVATE_KEY_ARN = 'abc';
});

test('Authentication using basic auth', async () => {
  const credentials = Buffer.from('readClient:geheim', 'utf-8').toString('base64');
  const header = `Basic ${credentials}`;

  expect(authenticateRequest({
    headers: {
      Authorization: header,
    },
    body: 'abc=def',
  } as any)).toBe('readClient');
});

test('Authentication no body', async () => {
  const credentials = Buffer.from('readClient:geheim', 'utf-8').toString('base64');
  const header = `Basic ${credentials}`;

  expect(authenticateRequest({
    headers: {
      Authorization: header,
    },
  } as any)).toBe('readClient');
});

test('Authentication in body', async () => {
  expect(authenticateRequest({
    body: 'client_id=readClient&client_secret=geheim',
  } as any)).toBe('readClient');
});

test('Authentication using basic auth and body', async () => {
  const credentials = Buffer.from('readClient:geheim', 'utf-8').toString('base64');
  const header = `Basic ${credentials}`;

  expect(authenticateRequest({
    headers: {
      Authorization: header,
    },
    body: 'client_id=readClient&client_secret=geheim',
  } as any)).toBe('readClient');
});


