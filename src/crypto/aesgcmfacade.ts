import { BufUtils } from "../utils/bufutils";
import log from "loglevel";

export class AesGcmFacade {

    private getSubtle(): SubtleCrypto {
        return window.crypto.subtle;
    }

    getInitialVector(): Uint8Array {
        const buf: ArrayBuffer = BufUtils.base64decode("hello world");
        return new Uint8Array(buf);
        // return window.crypto.getRandomValues(new Uint8Array(12));
    }

    getAlgorithm(): AesGcmParams {
        const initialVector = this.getInitialVector();
        return {
            name: "AES-GCM",
            iv: initialVector,
        };
    }

    getKeyAlgorithm(): AesKeyAlgorithm | AesKeyGenParams {
        return {
            name: "AES-GCM",
            length: 256,
        };
    }

    getKeyUsages(): string[] {
        return ["encrypt", "decrypt"];
    }

    async generateKey(): Promise<CryptoKey> {
        const algo: AesKeyGenParams = this.getKeyAlgorithm();
        const keyUsages: string[] = this.getKeyUsages();
        return this.getSubtle().generateKey(algo, true, keyUsages);
    }

    async exportKey(key: CryptoKey): Promise<JsonWebKey> {
        return this.getSubtle().exportKey("jwk", key);
    }

    async importJsonWebKey(jwk: JsonWebKey): Promise<CryptoKey> {
        const keyUsages: string[] = this.getKeyUsages();
        log.log("importing " + keyUsages + " JsonWebKey")
        // log.log(type, "jwk", jwk);
        const keyAlgo = this.getKeyAlgorithm();
        return this.getSubtle().importKey("jwk", jwk, keyAlgo, true, keyUsages);
    }

  async encrypt(key: CryptoKey, data: ArrayBuffer): Promise<string> {
    const algo = this.getAlgorithm();

    return this.getSubtle().encrypt(algo, key, data)
      .then(buf => BufUtils.base64encode(buf));
  }

  async decrypt(key: CryptoKey, base64data: string): Promise<ArrayBuffer> {
    const algo = this.getAlgorithm();
    const buf = BufUtils.base64decode(base64data);
    return this.getSubtle().decrypt(algo, key, buf);
  }
}