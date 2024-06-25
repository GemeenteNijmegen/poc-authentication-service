import * as fs from 'fs';
import * as path from 'path';
import { pemToJwk } from '../pem2jwk';

const pem = fs.readFileSync(path.join(__dirname, 'certificate.pem')).toString();

// TODO make this work
// jest.spyOn(AWS, 'getParameter').mockResolvedValue(pem);

test('pem to jwk', () => {
  const expected = {
    kty: 'RSA',
    n: 'xQ4EIig7c9t3k_edukIG1O14nqIj9hmtwuJzovht8gngyvY1kagzCESNWh3K5AKhDd0M_YNqRLA9on_qIT74Vhw58oNt1gqW_9rBFZhFqme-S8xnjEYwp_iI5WBzeHnPLC1h6VSGmmFgY7p3uQy0BvP9A4vm2URHpGwKDkWXa57os1uAFs8kRJjiJ330lavFPQE5pmrsReR1-Jk5Sqf977HjxbFvJsmoY7E9SvKLp7NyMPOdhTPZxXSEHccZaPscXRFTVOod_0PgwF69iX27Zw0k-eXAx-QqkuEG493RuG3-1rpgrdaEuv5MtUgkgQpK7NI8f6lzZMwmKgJ_g-6ANw',
    e: 'AQAB',
    kid: '8bdfde9ca7bdce70000d074eaa8117340795e71525b0472ba3a0e0ccc82e6d1e',
  };
  const jwk = pemToJwk(pem.toString());
  expect(jwk).toEqual(expected);
});
