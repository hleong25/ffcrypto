import { localFetch, localFetchJson } from "./localStorageFacade";

export interface defaults {
    privateKey?: JsonWebKey,
    publicKey?: JsonWebKey,
    encryptedData: string
};

export function getDefaults(): defaults {
    const useDefaultPrivateKey: boolean = true;
    const useDefaultPublicKey: boolean = useDefaultPrivateKey;
    const useEncryptedData: boolean = true && useDefaultPrivateKey && useDefaultPublicKey;

    return {
        privateKey: useDefaultPrivateKey ? localFetch('privateKey') : undefined,
        publicKey: useDefaultPublicKey ? localFetch('publicKey') : undefined,
        encryptedData: useEncryptedData ? localFetch('encryptedData') : "",
    };
}