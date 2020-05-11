import { updateTextbox } from "./domutils";
import { RsaFacade } from "./rsafacade";
import { getDefaults } from "./defaults";

console.log("main.ts -- " + (new Date).toISOString());

let ffcryptoDefaults = getDefaults();

updateTextbox("#exported-private-key", ffcryptoDefaults.privateKey);
updateTextbox("#exported-public-key", ffcryptoDefaults.publicKey);
updateTextbox("#encrypted-data", ffcryptoDefaults.encryptedData);

const rsaFacade = new RsaFacade();

function populateKeys() {
    console.log("generating rsa keys");

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


if ((ffcryptoDefaults.privateKey === null) && (ffcryptoDefaults.publicKey === null)) {
    populateKeys();
} else {
    enum Operation {
        ENCRYPT,
        DECRYPT,
    }

    rsaFacade.importJsonWebKeys(ffcryptoDefaults.privateKey, ffcryptoDefaults.publicKey)
        .then(keypair => {
            const op: Operation = ffcryptoDefaults.encryptedData ? Operation.DECRYPT : Operation.ENCRYPT;

            switch (+op) {
                case Operation.ENCRYPT:

                    const enc = new TextEncoder();
                    const encodedMsg = enc.encode("hello world\nhenry leong");

                    rsaFacade.encrypt(keypair.publicKey, encodedMsg)
                        .then(base64data => {
                            updateTextbox('#encrypted-data', base64data)
                        });

                    break;
                case Operation.DECRYPT:
                    console.log("decrypting...");

                    rsaFacade.decrypt(keypair.privateKey, ffcryptoDefaults.encryptedData)
                        .then(base64data => {
                            const dec = new TextDecoder();
                            const data = dec.decode(base64data);
                            updateTextbox('#decrypted-data', data)
                        });
                    break;
            }

        });

}
