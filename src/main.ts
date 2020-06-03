import log from "loglevel";
import { ImportKey } from "./crypto/ImportKey";
import container from "./injections";
import { LocalStorageFacade } from "./persist/localStorageFacade";
import Symbols from "./symbols";
import { BufUtils } from "./utils/bufutils";
import { getComponentById, updateTextbox } from "./utils/domutils";

let cryptoService!: ServiceCrypto;

export function main() {
    // bindUI();

    // cryptoService = new AesGcmService();
    // cryptoService.loadKeys();

    cryptoService = container.get<ServiceCrypto>(Symbols.AesGcmService);

    log.info("cryptoService", cryptoService);
    // cryptoService.loadKeys();
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

    let importKeyInput = getComponentById('import-key') as HTMLInputElement
    if (importKeyInput) {
        importKeyInput.onchange = onImportKeyBtnHandler;
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

function onImportKeyBtnHandler(e: Event) {

    var elem: HTMLInputElement = e.target as HTMLInputElement;
    var files: FileList = elem.files as FileList;
    var file = files.item(0) as File;

    file.text()
        .then(buf => {
            ImportKey.importPrivateKey(buf)
                .then(cryptoKey => {
                    log.info("cryptokey", cryptoKey);
                })
                .catch(err => {
                    log.error("failed to import key", err);
                });
        })
        .catch(err => {
            log.error("failed to get array buffer", err);
        });

    //     file.arrayBuffer()
    //         .then(buf => {
    //             ImportKey.importPrivateKeyFromArrayBuffer(buf)
    //             .then(cryptoKey => {
    //                 log.info("cryptokey", cryptoKey);
    //             })
    //             .catch(err => {
    //                 log.error("failed to import key", err);
    //             });
    //         })
    //         .catch(err => {
    //             log.error("failed to get array buffer", err);
    //         });
}
