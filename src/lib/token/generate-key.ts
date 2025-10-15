import crypto from 'crypto';

class GenerateJwtPrivateKey {
    private static instance: GenerateJwtPrivateKey;
    public readonly key: string;

    private constructor() {
        this.key = crypto.randomBytes(32).toString('hex');
    }

    public static getInstance(): GenerateJwtPrivateKey {
        if (!GenerateJwtPrivateKey.instance) {
            GenerateJwtPrivateKey.instance = new GenerateJwtPrivateKey();
        }
        return GenerateJwtPrivateKey.instance;
    }
}

export const generateJwtPrivateKey = GenerateJwtPrivateKey.getInstance();
