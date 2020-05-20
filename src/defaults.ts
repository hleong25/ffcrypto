import { LocalStorageFacade } from "./persist/localStorageFacade";
import log from "loglevel";

interface defaults {
    privateKey?: JsonWebKey,
    publicKey?: JsonWebKey,
    encryptedData: string
};

export function getDefaults(): defaults {
    try {
        return {
            privateKey: LocalStorageFacade.fetch('privateKey'),
            publicKey: LocalStorageFacade.fetch('publicKey'),
            encryptedData: LocalStorageFacade.fetch('encryptedData'),
        };
    } catch (err) {
        log.error("failed to get defaults. err:", err);
        throw err;
    }
}