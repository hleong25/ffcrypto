import { BufUtils } from "../../utils/bufutils";
import { LocalStorageFacade } from "../../persist/localStorageFacade";
import log from "loglevel";
import { injectable } from "inversify";
import container from "../../injections";
import Symbols from "../../symbols";
import { Buffer } from 'buffer';

@injectable()
export class AesGcmService implements ServiceCrypto {

    LS_KEY: string = 'aes-gcm-key';

    bufUtils: BufUtils;

    cryptoKey!: CryptoKey;

    constructor() {
        this.bufUtils = container.get<BufUtils>(Symbols.BufUtils);
    }

    private getSubtle(): SubtleCrypto {
        return crypto.subtle;
    }

    generateKeys(): void {
        const algo: AesKeyGenParams = {
            name: "AES-GCM",
            length: 256,
        };

        const keyUsages: KeyUsage[] = ["encrypt", "decrypt"];

        let genKeyPromise = this.getSubtle().generateKey(algo, true, keyUsages) as Promise<CryptoKey>;

        log.log("generating aes-gcm key...");
        genKeyPromise
            .then(cryptoKey => {
                this.cryptoKey = cryptoKey;
            })
            .catch(err => {
                log.error("failed to generate aes-gcm key", err);
            })
            .finally(() => {
                log.log("finished generating aes-gcm key...");
                this.exportKey();
            });
    }

    loadKeys(): void {
        const jwk: JsonWebKey = LocalStorageFacade.fetch(this.LS_KEY);
        const keyUsages: KeyUsage[] = ["encrypt", "decrypt"];
        const keyAlgo: AesKeyAlgorithm = {
            name: "AES-GCM",
            length: 256,
        };

        log.log("importing aes-gcm key...");
        let importKeyPromise = this.getSubtle().importKey("jwk", jwk, keyAlgo, true, keyUsages) as Promise<CryptoKey>;
        importKeyPromise
            .then(cryptoKey => {
                this.cryptoKey = cryptoKey;
            })
            .catch(err => {
                log.error("failed to import aes-gcm key", err);
            })
            .finally(() => {
                log.log("finished importing aes-gcm key...");
            });
    }

    private exportKey() {
        log.log("exporting aes-gcm key...");

        let exportKeyPromise = this.getSubtle().exportKey("jwk", this.cryptoKey) as Promise<JsonWebKey>;
        exportKeyPromise
            .then(jwk => {
                log.info("export key", jwk);
                LocalStorageFacade.persist(this.LS_KEY, jwk);
            })
            .catch(err => {
                log.error("failed to export aes-gcm key", err);
            })
            .finally(() => {
                log.log("finished exporting aes-gcm key...");
            });
    }

    private generateInitialVector(passphrase: string): Buffer {
        return this.bufUtils.str2buffer(passphrase);
    }

    private getAesGcmParams(passphrase: string): AesGcmParams {
        return {
            name: "AES-GCM",
            iv: this.generateInitialVector(passphrase),
        };
    }

    /**
     * Encrypts the data using the passpharse.
     * 
     * @param passphrase user input for passphrase
     * @param data the data to encrypt
     * 
     * @returns the encrypted data in an ArrayBuffer
     */
    async encrypt(passphrase: string, data: ArrayBuffer): Promise<ArrayBuffer> {
        const algo: AesGcmParams = this.getAesGcmParams(passphrase);
        const key: CryptoKey = this.cryptoKey;

        // log.info("algo", algo, "key", key);

        return this.getSubtle().encrypt(algo, key, data);
    }

    /**
     * Decrypts the data using the passphrase.
     * 
     * @param passphrase user input for passphrase
     * @param base64data the encoded data
     * 
     * @returns the decrypted data in ArrayBuffer
     */
    async decrypt(passphrase: string, base64data: string): Promise<ArrayBuffer> {
        const algo: AesGcmParams = this.getAesGcmParams(passphrase);
        const key: CryptoKey = this.cryptoKey;
        const buf: ArrayBuffer = this.bufUtils.base64decode(base64data);

        return this.getSubtle().decrypt(algo, key, buf);
    }


}