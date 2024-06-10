#!/bin/bash

mkdir -p jwk
cd jwk
echo "Creating keys and certificate..."
/opt/homebrew/opt/openssl@1.1/bin/openssl genpkey -algorithm RSA > private_key.pem
/opt/homebrew/opt/openssl@1.1/bin/openssl pkey -pubout -in private_key.pem > public_key.pem
/opt/homebrew/opt/openssl@1.1/bin/openssl req -x509 -key private_key.pem -subj /CN=client.example.com -days 1000 > certificate.pem
echo "Creating JWK..."
npx --yes pem-jwk public_key.pem > public_key.jwk
CERT=$(sed /-/d certificate.pem | tr -d \\n)
jq ".+{\"x5c\":[\"$CERT\"]}" public_key.jwk > pub+cert.jwk
cd ..