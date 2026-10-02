export interface EncryptedPayloadEnvelope {
    encrypted: boolean;
    iv: string;
    data: string;
    timestamp?: number;
}

const SECRET_PASSPHRASE = import.meta.env.VITE_ENCRYPTION_KEY || 'BarangayCansojongSecretPayloadKey2026!';
const ENCRYPTION_ENABLED = import.meta.env.VITE_ENCRYPTION_ENABLED !== 'false';

let cachedCryptoKey: CryptoKey | null = null;

const getCryptoKey = async (): Promise<CryptoKey> => {

    if (cachedCryptoKey) {
        return cachedCryptoKey;
    }

    const encoder = new TextEncoder();
    const passphraseBytes = encoder.encode(SECRET_PASSPHRASE);

    const hashBuffer = await window.crypto.subtle.digest('SHA-256', passphraseBytes);

    cachedCryptoKey = await window.crypto.subtle.importKey(
        'raw',
        hashBuffer,
        { name: 'AES-GCM' },
        false,
        ['encrypt', 'decrypt']
    );

    return cachedCryptoKey;
};

const base64ToUint8Array = (base64: string): Uint8Array => {
    const binaryString = window.atob(base64);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes;
}

const uint8ArrayToBase64 = (bytes: Uint8Array): string => {
    let binary = '';

    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
        binary += String.fromCharCode(bytes[i]);
    }

    return window.btoa(binary);
};

export const isEncryptedEnvelop = (payload: unknown): payload is EncryptedPayloadEnvelope => {
    return (
        typeof payload === 'object' &&
        payload !== null &&
        (payload as EncryptedPayloadEnvelope).encrypted === true &&
        typeof (payload as EncryptedPayloadEnvelope).iv === 'string' &&
        typeof (payload as EncryptedPayloadEnvelope).data === 'string'
    );
};

export const decryptPayload = async (envelope: EncryptedPayloadEnvelope): Promise<string> => {
    if (!ENCRYPTION_ENABLED) {
        return envelope.data;
    }

    const key = await getCryptoKey();
    const ivBytes = base64ToUint8Array(envelope.iv);
    const cipherBytes = base64ToUint8Array(envelope.data);

    const decryptedBuffer = await window.crypto.subtle.decrypt(
        {
            name: 'AES-GCM',
            iv: new Uint8Array(ivBytes),
            tagLength: 128,
        },
        key,
        new Uint8Array(cipherBytes)
    )

    return new TextDecoder().decode(decryptedBuffer)
};

export const encryptPayload = async (plainText: string): Promise<EncryptedPayloadEnvelope> => {
    const key = await getCryptoKey();
    const iv = new Uint8Array(12);
    window.crypto.getRandomValues(iv);

    const encoder = new TextEncoder();
    const dataBytes = encoder.encode(plainText);

    const cipherBuffer = await window.crypto.subtle.encrypt(
        {
            name: 'AES-GCM',
            iv,
            tagLength: 128,
        },
        key,
        dataBytes
    );

    return {
        encrypted: true,
        iv: uint8ArrayToBase64(iv),
        data: uint8ArrayToBase64(new Uint8Array(cipherBuffer)),
        timestamp: Date.now()
    };
};