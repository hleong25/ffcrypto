# ffcrypto

## vscode setup

install jest for unit testing

## install required node modules

`npm install`

## build

cli: `npm run build-dev`
vscode: `ctrl+shift+p` > `Debug NPM Script` > `build-dev

## generate key

`openssl genrsa -des3 -out private.pem 2048`

`openssl pkcs8 -topk8 -nocrypt -outform pem -in ./private.pem -out private_unencrypted.pem`
