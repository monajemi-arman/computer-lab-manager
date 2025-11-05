import { utils } from 'ssh2';

export const generateSshKeys = async (): Promise<utils.KeyPairReturn | null> =>
    await new Promise((resolve) => utils.generateKeyPair('ed25519', (err, keys) => {
        if (err) throw err;
        resolve(keys)
    }));