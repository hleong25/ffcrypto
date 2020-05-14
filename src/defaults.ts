import { LocalStorageFacade } from "./localStorageFacade";
import log from "loglevel";

export interface defaults {
    privateKey?: JsonWebKey,
    publicKey?: JsonWebKey,
    encryptedData: string
};

export function getDefaults(): defaults {
    const useDefaultPrivateKey: boolean = true;
    const useDefaultPublicKey: boolean = useDefaultPrivateKey;
    const useEncryptedData: boolean = useDefaultPrivateKey && useDefaultPublicKey;

    try {
        return {
            privateKey: useDefaultPrivateKey ? LocalStorageFacade.fetch('privateKey') : undefined,
            publicKey: useDefaultPublicKey ? LocalStorageFacade.fetch('publicKey') : undefined,
            encryptedData: useEncryptedData ? LocalStorageFacade.fetch('encryptedData') : "",
        };
    } catch (err) {
        log.error("failed to get defaults. err:", err);
        throw err;
    }
}