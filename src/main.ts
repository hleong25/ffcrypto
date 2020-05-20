import _ from "lodash";
import { updateTextbox, getComponentById } from "./utils/domutils";
import { RsaFacade } from "./crypto/rsafacade";
import { getDefaults } from "./utils/defaults";
import log from "loglevel";
import { LocalStorageFacade } from "./persist/localStorageFacade";
import { AesGcmFacade } from "./crypto/aesgcmfacade";

const ffcryptoDefaults = getDefaults();
const rsaFacade = new RsaFacade();
const aesGcmFacade = new AesGcmFacade();

export function main() {
    bindUI();
}

function bindUI() {
    log.log("binding ui...");

    let genKeysBtn = getComponentById('generate-keys') as HTMLButtonElement;
    if (genKeysBtn) {
        genKeysBtn.onclick = populateAesGcmKeys;
    }

    let persistDataBtn = getComponentById('persisted-data') as HTMLButtonElement;
    if (persistDataBtn) {
        persistDataBtn.onclick = loadPersistedData;
    }

    let encryptBtn = getComponentById('encrypt-data') as HTMLButtonElement;
    if (encryptBtn) {
        encryptBtn.onclick = encryptAesGcmEventHandler;
    }

    let decryptBtn = getComponentById('decrypt-data') as HTMLButtonElement;
    if (decryptBtn) {
        decryptBtn.onclick = decryptAesGcmEventHandler;
    }
}

function populateAesGcmKeys(e: Event) {
    log.log("generating aes gcm keys", e);

    aesGcmFacade.generateKey()
        .then(key => {

            log.info("aes-gcm key", key);

            aesGcmFacade.exportKey(key)
            .then(exportedKey => {

                log.info("exportedKey", exportedKey);

                LocalStorageFacade.persist('aesGcmKey', exportedKey);
            });
        })
}

function populateRsaKeys(e: Event) {
    log.log("generating rsa keys", e);

    rsaFacade.generateKey()
        .then(keyPair => {

            rsaFacade.exportKey(keyPair.privateKey)
                .then(exportedKey => {
                    LocalStorageFacade.persist('privateKey', exportedKey);
                });

            rsaFacade.exportKey(keyPair.publicKey)
                .then(exportedKey => {
                    LocalStorageFacade.persist('publicKey', exportedKey);
                });
        })
}

function loadPersistedData(e: Event) {
    updateTextbox("data", ffcryptoDefaults.encryptedData || '');
}

function encryptAesGcmEventHandler(e: Event) {
    log.info("encrypting...");

    const jsonWebKey: JsonWebKey = LocalStorageFacade.fetch("aesGcmKey");
    aesGcmFacade.importJsonWebKey(jsonWebKey)
        .then(key => {
            let dataTxtBox = getComponentById('data') as HTMLTextAreaElement;

            const enc = new TextEncoder();
            const encodedMsg = enc.encode(dataTxtBox.value);

            aesGcmFacade.encrypt(key, encodedMsg)
                .then(base64str => {
                    log.log("after encrypt");

                    updateTextbox('data', base64str)
                    LocalStorageFacade.persist('aesGcmEncryptedData', base64str);
                })
                .catch(err => log.error("failed to encrypt", err))
                .finally(() => log.info("finished encrypting..."));
        })
        .catch(err => log.error("failed to import aes-gcm-key jwk", err));

}

function encryptRsaEventHandler(e: Event) {
    log.info("encrypting...");

    const jsonWebKey: JsonWebKey = ffcryptoDefaults.publicKey || {};
    rsaFacade.importJsonWebKey('encrypt', jsonWebKey)
        .then(pubKey => {
            let dataTxtBox = getComponentById('data') as HTMLTextAreaElement;

            const enc = new TextEncoder();
            const encodedMsg = enc.encode(dataTxtBox.value);

            rsaFacade.encrypt(pubKey, encodedMsg)
                .then(base64str => {
                    log.log("after encrypt");

                    updateTextbox('data', base64str)
                    LocalStorageFacade.persist('encryptedData', base64str);
                })
                .catch(err => log.error("failed to encrypt", err))
                .finally(() => log.info("finished encrypting..."));
        })
        .catch(err => log.error("failed to import encrypt jwk", err));

}

function decryptRsaEventHandler(e: Event) {
    log.info("decrypting...");

    const jsonWebKey: JsonWebKey = ffcryptoDefaults.privateKey || {};
    rsaFacade.importJsonWebKey('decrypt', jsonWebKey)
        .then(privKey => {

            let dataTxtBox = getComponentById('data') as HTMLTextAreaElement;
            const encryptedData = dataTxtBox.value;

            rsaFacade.decrypt(privKey, encryptedData)
                .then(base64buf => {
                    const dec = new TextDecoder();
                    const data = dec.decode(base64buf);
                    updateTextbox('data', data)
                })
                .catch(err => log.error("failed to decrypt", err))
                .finally(() => log.info("finished decrypting..."));
        })
        .catch(err => log.error("failed to import decrypt jwk", err));

}

function decryptAesGcmEventHandler(e: Event) {
    log.info("decrypting...");

    const jsonWebKey: JsonWebKey = LocalStorageFacade.fetch("aesGcmKey");
    aesGcmFacade.importJsonWebKey(jsonWebKey)
        .then(key => {

            let dataTxtBox = getComponentById('data') as HTMLTextAreaElement;
            const encryptedData = dataTxtBox.value;

            aesGcmFacade.decrypt(key, encryptedData)
                .then(base64buf => {
                    const dec = new TextDecoder();
                    const data = dec.decode(base64buf);
                    updateTextbox('data', data)
                })
                .catch(err => log.error("failed to decrypt", err))
                .finally(() => log.info("finished decrypting..."));
        })
        .catch(err => log.error("failed to import decrypt aes-gcm-key jwk", err));
}


