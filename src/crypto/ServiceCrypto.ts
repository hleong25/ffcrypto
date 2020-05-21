interface ServiceCrypto {

    generateKeys(): void;
    loadKeys(): void;

    encrypt(passphrase: string, data: ArrayBuffer): Promise<ArrayBuffer>;
    decrypt(passphrase: string, base64data: string): Promise<ArrayBuffer>;
}