import { X509Certificate } from 'crypto';
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
    kid: '8BECC9B03D49FC1EED48BC28BBAAF3E8273693E6D015E97FBD96F21C79457F21',
  };
  const jwk = pemToJwk(pem.toString());
  expect(jwk).toEqual(expected);
});


test('woegijweoewigj', async () => {
  new X509Certificate('-----BEGIN PUBLIC KEY-----\n\
MIICIjANBgkqhkiG9w0BAQEFAAOCAg8AMIICCgKCAgEApgM6+JUdVzlU7iYafTlC\n\
/rzhlpbnylDU4OiQoXl18CiyDNZxvY01WmxDMfGXeLTwtLK/tWb15yT1LJI2Hm3P\n\
6aZo8VImF5mC9dDdETb5RiDCi1N9/GZi9UtR1yI2cZ5HU2AtY3VvZaBPxFF6JVlV\n\
MkAX/v/jwHXRBUg2GWrUyY47ySC4kl2HS8pA4HSnTQV9YJkIKQfhke7M+hw8EIQj\n\
91JkxPj1O9avOre+qRijdgpoC12HxEwji7+PEDhTheVl+VDl97nkfYu9f1nkiPS8\n\
B33m6VdpWIA28kFn1LRT3lb0iAwnkjnpnBumBgesQMMawuf40HQJjfLiXLXUkw62\n\
zhmHgza9eTHu9HoptUaz5dPQuzw3AzIdYgEsofpobxiDmk1sape+qWMc50K946cB\n\
3YWbfzYlUAEcgRhSxft/DiSjeqPUk9YNk53dBpDeJQNedEs84d15kBwZGUAJRPVz\n\
A2QzL6yFudPwLhBwGuC6LvpgruHolZQEmkb81CINp6hHVDjfX+tuNyQtSYO1FPzA\n\
gB1mLOatMPIJHhxts+ZsXU+B9Qq7PshgDk1GHlsD5LIe0cLOCdD1mJavOt+KBhbn\n\
RBF9PPHr+Yte9YvToAbFNuxpnQcfh2eHf3P39UZ3YNbVxHdbf5lp1kr2Q6C3viN1\n\
UazhpsR+pmdxCxZCV8S0nVECAwEAAQ==\n\
-----END PUBLIC KEY-----');
});


