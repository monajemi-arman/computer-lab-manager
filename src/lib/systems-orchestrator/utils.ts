import crypto from 'crypto';

export const generateSshKeys = (): { public: string, private: string } => {
    const { privateKey, publicKey } = crypto.generateKeyPairSync('rsa', {
        modulusLength: 4096,
        publicKeyEncoding: {
            type: 'pkcs1',
            format: 'pem',
        },
        privateKeyEncoding: {
            type: 'pkcs1',
            format: 'pem',
        },
    });

    const sshPublicKey = convertToOpenSSH(publicKey);

    return {
        public: sshPublicKey,
        private: privateKey,
    };
};

const convertToOpenSSH = (pemPublicKey: string): string => {
    const keyData = pemPublicKey
        .replace(/-----BEGIN RSA PUBLIC KEY-----/, '')
        .replace(/-----END RSA PUBLIC KEY-----/, '')
        .replace(/\n/g, '')
        .trim();

    // Decode base64 to get the DER encoded key
    const derBuffer = Buffer.from(keyData, 'base64');

    const sshRsaHeader = Buffer.from('ssh-rsa');
    const keyBuffer = derBuffer;

    const openSshKey = `ssh-rsa ${Buffer.concat([sshRsaHeader, keyBuffer]).toString('base64')}`;

    return openSshKey;
};
