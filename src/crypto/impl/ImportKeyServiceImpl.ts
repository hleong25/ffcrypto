import { injectable } from "inversify";
import log from "loglevel";
import { BufUtils } from "../../utils/bufutils";
import container from "../../injections";
import Symbols from "../../symbols";
import { Buffer } from 'buffer';

@injectable()
export class ImportKeyServiceImpl implements ImportKeyService {

    bufUtils: BufUtils;

    constructor() {
        this.bufUtils = container.get<BufUtils>(Symbols.BufUtils);
    }

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
        const binaryDer: Buffer = this.bufUtils.str2buffer(binaryDerString);

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
        const binaryDer: Buffer = this.bufUtils.str2buffer(binaryDerString);

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
        if (!regexBegin.test(pem) && !regexEnd.test(pem)) {
            return null;
        }

        const startIdx: number = regexBegin.lastIndex;
        const endIdx: number = pem.search(regexEnd);

        return pem.slice(startIdx, endIdx);
    }

}