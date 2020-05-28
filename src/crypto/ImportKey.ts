import { BufUtils } from "../utils/bufutils";
import log from "loglevel";

export namespace ImportKey {
    export async function importPrivateKey(pem: string) : Promise<CryptoKey> {
        // fetch the part of the PEM string between header and footer
        log.info("pem", pem);
        const pemHeader = "-----BEGIN PRIVATE KEY-----";
        const pemFooter = "-----END PRIVATE KEY-----";
        const pemContents = pem.substring(pemHeader.length, pem.length - pemFooter.length-1).trim();
        log.info("contents", pemContents);
        // base64 decode the string to get the binary data
        const binaryDerString = window.atob(pemContents);
        // convert from a binary string to an ArrayBuffer
        const binaryDer: ArrayBuffer = BufUtils.str2ab(binaryDerString);

        const rsaImport: RsaHashedImportParams = {
                name: "RSA-PSS",
                // Consider using a 4096-bit key for systems that require long-term security
                // modulusLength: 2048,
                // publicExponent: new Uint8Array([1, 0, 1]),
                hash: "SHA-256",
            }

        return window.crypto.subtle.importKey(
            "pkcs8",
            binaryDer,
            rsaImport,
            true,
            ["sign"]
        );
    }

    export async function importPrivateKeyFromArrayBuffer(pem: ArrayBuffer): Promise<CryptoKey> {
        log.info("pem", pem);

        const pemHeader = "-----BEGIN PRIVATE KEY-----";
        const pemFooter = "-----END PRIVATE KEY-----";
        const pemContents = pem.slice(pemHeader.length, pem.byteLength - pemFooter.length);
        const rsaImport: RsaHashedImportParams = {
                name: "RSA-PSS",
                // Consider using a 4096-bit key for systems that require long-term security
                // modulusLength: 2048,
                // publicExponent: new Uint8Array([1, 0, 1]),
                hash: "SHA-256",
            }

        return window.crypto.subtle.importKey(
            "pkcs8",
            pemContents,
            rsaImport,
            true,
            ["sign"]
        );
    }
}