import { injectable } from "inversify";
import log from "loglevel";
import { BufUtils } from "../../utils/bufutils";

@injectable()
export class ImportKeyServiceImpl implements ImportKeyService {

    private getSubtle(): SubtleCrypto {
        return crypto.subtle;
    }

    async importKey(pem: string): Promise<CryptoKey> {
        return this.parsePrivateKey(pem)
            .then(privKey => {
                return Promise.resolve(privKey);
            })
            .catch(errPrivKey => {
                log.debug("failed to parse private key", errPrivKey);

                return this.parsePublicKey(pem)
                    .then(pubKey => {
                        return Promise.resolve(pubKey);

                    })
                    .catch(errPubKey => {
                        log.debug("failed to parse public key", errPubKey);
                        log.error("Failed to parse key for import", errPubKey);

                        return Promise.reject("unknown key for import");
                    })
            })
    }

    private async parsePublicKey(pem: string): Promise<CryptoKey> {
        const regexBegin: RegExp = /^-----BEGIN PUBLIC KEY-----\s*/g;
        const regexEnd: RegExp = /-----END PUBLIC KEY-----\s*$/;
        const contents = this.getKeyContents(pem, regexBegin, regexEnd);

        if (contents == null) {
            return Promise.reject("not public key");
        }

        const binaryDerString = window.atob(contents);
        const binaryDer: ArrayBuffer = BufUtils.str2ab(binaryDerString);

        const rsaImport: RsaHashedImportParams = {
            name: "RSA-OAEP",
            hash: "SHA-256",
        }

        return this.getSubtle().importKey(
            "spki",
            binaryDer,
            rsaImport,
            true,
            ["encrypt"]
        );

    }

    private async parsePrivateKey(pem: string): Promise<CryptoKey> {
        const regexBegin: RegExp = /^-----BEGIN PRIVATE KEY-----\s+/g;
        const regexEnd: RegExp = /\s+-----END PRIVATE KEY-----\s*$/;
        const contents = this.getKeyContents(pem, regexBegin, regexEnd);

        if (contents == null) {
            return Promise.reject("not private key");
        }

        const binaryDerString = window.atob(contents);
        const binaryDer: ArrayBuffer = BufUtils.str2ab(binaryDerString);

        const rsaImport: RsaHashedImportParams = {
            name: "RSA-PSS",
            hash: "SHA-256",
        }

        return this.getSubtle().importKey(
            "pkcs8",
            binaryDer,
            rsaImport,
            true,
            ["sign"]
        );
    }

    private getKeyContents(pem: string, regexBegin: RegExp, regexEnd: RegExp): string | null {
        let startIdx: number = -1;
        let endIdx: number = -1;

        if (regexBegin.test(pem)) {
            startIdx = regexBegin.lastIndex;
        }

        if (regexEnd.test(pem)) {
            endIdx = pem.search(regexEnd);
        }

        if (startIdx < 0 && endIdx < 0) {
            return null;
        }

        return pem.slice(startIdx, endIdx);
    }


}