import _ from "lodash";
import { updateTextbox, getComponentById } from "./utils/domutils";
import log from "loglevel";
import { LocalStorageFacade } from "./persist/localStorageFacade";
import { AesGcmService } from "./crypto/impl/AesGcmService";
import { BufUtils } from "./utils/bufutils";

let cryptoService!: ServiceCrypto;

export function main() {
    bindUI();

    cryptoService = new AesGcmService();
    cryptoService.loadKeys();
}

function bindUI() {
    log.log("binding ui...");

    let genKeysBtn = getComponentById('generate-keys') as HTMLButtonElement;
    if (genKeysBtn) {
        genKeysBtn.onclick = onGenerateKeysHandler;
    }

    let encryptBtn = getComponentById('encrypt-data') as HTMLButtonElement;
    if (encryptBtn) {
        encryptBtn.onclick = onEncryptButtonHandler;;
    }

    let decryptBtn = getComponentById('decrypt-data') as HTMLButtonElement;
    if (decryptBtn) {
        decryptBtn.onclick = onDecryptButtonHandler;
    }
}

function onGenerateKeysHandler(e: Event) {
    cryptoService.generateKeys();
}

function onEncryptButtonHandler(e: Event) {
    let dataTxtBox = getComponentById('data') as HTMLTextAreaElement;
    const enc = new TextEncoder();
    const encodedMsg: Uint8Array = enc.encode(dataTxtBox.value);

    log.log("encrypting data...");
    cryptoService
        .encrypt("my secret passphrase", encodedMsg)
        .then(buf => {
            const base64str: string = BufUtils.base64encode(buf);
            updateTextbox('data', base64str)
            LocalStorageFacade.persist('aesGcmEncryptedData', base64str);
        })
        .catch(err => {
            log.error("failed to encrypt data", err);
        })
        .finally(() => {
            log.log("finished encrypting data...");
        });

}

function onDecryptButtonHandler(e: Event) {
    let dataTxtBox = getComponentById('data') as HTMLTextAreaElement;

    log.log("decrypting data...");
    cryptoService
        .decrypt("my secret passphrase", dataTxtBox.value)
        .then(buf => {
            const dec = new TextDecoder();
            const data = dec.decode(buf);

            updateTextbox('data', data)
        })
        .catch(err => {
            log.error("failed to decrypt data", err);
        })
        .finally(() => {
            log.log("finished decrypting data...");
        });
}
