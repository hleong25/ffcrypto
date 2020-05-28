# ffcrypto

## generate key

`openssl genrsa -des3 -out private.pem 2048`

`openssl pkcs8 -topk8 -nocrypt -outform pem -in ./private.pem -out private_unencrypted.pem`
