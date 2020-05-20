import { BufUtils } from "../bufutils";
import log from "loglevel";

export class RsaFacade {

  private getSubtle(): SubtleCrypto {
    return window.crypto.subtle;
  }

  getAlgorithm(): RsaHashedKeyGenParams {
    return {
      name: "RSA-OAEP",
      modulusLength: 4096,
      publicExponent: new Uint8Array([1, 0, 1]),
      hash: "SHA-256",
    };
  }

  async generateKey(): Promise<CryptoKeyPair> {
    const algo = this.getAlgorithm();
    return this.getSubtle().generateKey(algo, true, ["encrypt", "decrypt"])
  }

  async exportKey(key: CryptoKey): Promise<JsonWebKey> {
    return this.getSubtle().exportKey("jwk", key);
  }

  async importKey(type: string, jsonkey: string): Promise<CryptoKey> {
    const jwk = <JsonWebKey>JSON.parse(jsonkey);
    const algo = this.getAlgorithm();
    return this.getSubtle().importKey("jwk", jwk, algo, true, [type])
  }

  async importKeys(privateKey: string, publicKey: string): Promise<CryptoKeyPair> {

    const privKey: CryptoKey = await this.importKey("decrypt", privateKey);
    const pubKey: CryptoKey = await this.importKey("encrypt", publicKey);

    const keypair: CryptoKeyPair = new CryptoKeyPair();
    keypair.privateKey = privKey;
    keypair.publicKey = pubKey;

    return Promise.resolve(keypair);
  }

  async importJsonWebKey(type: string, jwk: JsonWebKey): Promise<CryptoKey> {
    log.log("importing " + type + " JsonWebKey")
    // log.log(type, "jwk", jwk);
    const algo = this.getAlgorithm();
    return this.getSubtle().importKey("jwk", jwk, algo, true, [type]);
  }

  async importJsonWebKeys(privateKey: JsonWebKey, publicKey: JsonWebKey): Promise<CryptoKeyPair> {

    try {
      const privKey: CryptoKey = await this.importJsonWebKey("decrypt", privateKey);
      const pubKey: CryptoKey = await this.importJsonWebKey("encrypt", publicKey);

      const keypair: CryptoKeyPair = {
        privateKey: privKey,
        publicKey: pubKey
      }

      return Promise.resolve(keypair);
    } catch (err) {
      log.error("importing JsonWebKey failed.", err);
      throw err;
    }
  }

  private withinEncryptionLimits(algo: RsaHashedKeyGenParams, data: ArrayBuffer) {
    // max that this rsa oaep can encrypt is 446 bytes.
    // https://crypto.stackexchange.com/questions/42097/what-is-the-maximum-size-of-the-plaintext-message-for-rsa-oaep

    const maxlen = 446;

    if (data.byteLength > maxlen) {
      throw new RangeError("Data("+data.byteLength+") to encrypt is over the maximum length "+maxlen);
    }
  }

  async encrypt(publicKey: CryptoKey, data: ArrayBuffer): Promise<string> {
    const algo = this.getAlgorithm();
    this.withinEncryptionLimits(algo, data);

    return this.getSubtle().encrypt(algo, publicKey, data)
      .then(buf => BufUtils.base64encode(buf));
  }

  async decrypt(privateKey: CryptoKey, base64data: string): Promise<ArrayBuffer> {
    const algo = this.getAlgorithm();
    const buf = BufUtils.base64decode(base64data);
    return this.getSubtle().decrypt(algo, privateKey, buf);
  }

}