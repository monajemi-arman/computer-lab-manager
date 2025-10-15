import crypto from 'crypto';

class GenerateJwtPrivateKey {
    static #instance: GenerateJwtPrivateKey;
    key!: string;

    private constructor() {
        if (!GenerateJwtPrivateKey.#instance) {
            GenerateJwtPrivateKey.#instance = new GenerateJwtPrivateKey();
            GenerateJwtPrivateKey.#instance.key = this.makeKey();
        }

        return GenerateJwtPrivateKey.#instance;
    }

    public static get instance(): GenerateJwtPrivateKey {
        return GenerateJwtPrivateKey.#instance;
    }

    private makeKey() {
        return crypto.randomBytes(32).toString('hex');
    }
}

export const generateJwtPrivateKey = GenerateJwtPrivateKey.instance;