import _ from "lodash";
import { updateTextbox, getComponentById } from "./domutils";
import { RsaFacade } from "./rsafacade";
import { getDefaults } from "./defaults";
import log from "loglevel";
import { LocalStorageFacade } from "./localStorageFacade";

const ffcryptoDefaults = getDefaults();
const rsaFacade = new RsaFacade();

export function main() {
    showDefaults();

    bindUI();

    // if (_.isNull(ffcryptoDefaults.privateKey) && _.isNull(ffcryptoDefaults.publicKey)) {
    //     populateKeys();
    // } else {
    //     doOperation();
    // }
}

function showDefaults() {
    updateTextbox("exported-private-key", ffcryptoDefaults.privateKey || '');
    updateTextbox("exported-public-key", ffcryptoDefaults.publicKey || '');
    // updateTextbox("#encrypted-data", ffcryptoDefaults.encryptedData || '');
}

function bindUI() {
    log.log("binding ui...");

    let genKeysBtn = getComponentById('generate-keys') as HTMLButtonElement;
    if (genKeysBtn) {
        genKeysBtn.onclick = populateKeys;
    }

    let persistDataBtn = getComponentById('persisted-data') as HTMLButtonElement;
    if (persistDataBtn) {
        persistDataBtn.onclick = loadPersistedData;
    }

    let encryptBtn = getComponentById('encrypt-data') as HTMLButtonElement;
    if (encryptBtn) {
        encryptBtn.onclick = encryptEventHandler;
    }

    let decryptBtn = getComponentById('decrypt-data') as HTMLButtonElement;
    if (decryptBtn) {
        decryptBtn.onclick = decryptEventHandler;
    }
}

function populateKeys(e: Event) {
    log.log("generating rsa keys", e);

    updateTextbox("exported-private-key", "generating...");
    updateTextbox("exported-public-key", "generating...");

    rsaFacade.generateKey()
        .then(keyPair => {

            rsaFacade.exportKey(keyPair.privateKey)
                .then(exportedKey => {
                    updateTextbox("exported-private-key", exportedKey);
                    LocalStorageFacade.persist('privateKey', exportedKey);
                });

            rsaFacade.exportKey(keyPair.publicKey)
                .then(exportedKey => {
                    updateTextbox("exported-public-key", exportedKey);
                    LocalStorageFacade.persist('publicKey', exportedKey);
                });
        })
}

function loadPersistedData(e: Event) {
    updateTextbox("#data", ffcryptoDefaults.encryptedData || '');
}

function encryptEventHandler(e: Event) {
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

function decryptEventHandler(e: Event) {
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

