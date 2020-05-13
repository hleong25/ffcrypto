import _ from "lodash";
import { updateTextbox } from "./domutils";
import { RsaFacade } from "./rsafacade";
import { getDefaults } from "./defaults";
import log from "loglevel";

const ffcryptoDefaults = getDefaults();
const rsaFacade = new RsaFacade();

export function main() {
    showDefaults();

    if (_.isUndefined(ffcryptoDefaults.privateKey) && _.isUndefined(ffcryptoDefaults.publicKey)) {
        populateKeys();
    } else {
        doOperation();
    }
}

function showDefaults() {
    updateTextbox("#exported-private-key", ffcryptoDefaults.privateKey || '');
    updateTextbox("#exported-public-key", ffcryptoDefaults.publicKey || '');
    updateTextbox("#encrypted-data", ffcryptoDefaults.encryptedData || '');
}

function populateKeys() {
    log.log("generating rsa keys");

    rsaFacade.generateKey()
        .then(keyPair => {

            rsaFacade.exportKey(keyPair.privateKey)
                .then(exportedKey => {
                    updateTextbox("#exported-private-key", exportedKey);
                    ffcryptoDefaults.privateKey = <JsonWebKey>JSON.parse(exportedKey);
                });

            rsaFacade.exportKey(keyPair.publicKey)
                .then(exportedKey => {
                    updateTextbox("#exported-public-key", exportedKey);
                    ffcryptoDefaults.publicKey = <JsonWebKey>JSON.parse(exportedKey);
                });
        })
}

function doOperation() {
    enum Operation {
        ENCRYPT,
        DECRYPT,
    }

    const privKey: JsonWebKey = ffcryptoDefaults.privateKey || {};
    const pubKey: JsonWebKey = ffcryptoDefaults.publicKey || {};

    rsaFacade.importJsonWebKeys(privKey, pubKey)
        .then(keypair => {
            const op: Operation = _.isEmpty(ffcryptoDefaults.encryptedData) ? Operation.ENCRYPT : Operation.DECRYPT;
            switch (+op) {
                case Operation.ENCRYPT:
                    sampleEncrypt(keypair);
                    break;
                case Operation.DECRYPT:
                    sampleDecrypt(keypair);
                    break;
            }

        });
}

function sampleEncrypt(keypair: CryptoKeyPair) {
    log.info("encrypting...");

    const enc = new TextEncoder();
    const encodedMsg = enc.encode("hello world\nhenry leong");

    rsaFacade.encrypt(keypair.publicKey, encodedMsg)
        .then(base64data => {
            updateTextbox('#encrypted-data', base64data)
        });
}

function sampleDecrypt(keypair: CryptoKeyPair) {
    log.info("decrypting...");

    rsaFacade.decrypt(keypair.privateKey, ffcryptoDefaults.encryptedData)
        .then(base64data => {
            const dec = new TextDecoder();
            const data = dec.decode(base64data);
            updateTextbox('#decrypted-data', data)
        });
}
