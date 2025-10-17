class GenerateJwtPrivateKey {
	private static instance: GenerateJwtPrivateKey;
	public readonly key: string;

	private constructor() {
		if (process.env.NODE_ENV === "development") {
			this.key = process.env.DEV_JWT_PRIVATE_KEY ?? "dev_jwt_private_key_change_me";
			return;
		}

		const cryptoObj = (globalThis as any).crypto || (globalThis as any).msCrypto;
		if (!cryptoObj || typeof cryptoObj.getRandomValues !== 'function') {
			throw new Error('Secure random number generator not available in this runtime.');
		}
		const bytes = cryptoObj.getRandomValues(new Uint8Array(32));
		this.key = Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join('');
	}

	public static getInstance(): GenerateJwtPrivateKey {
		if (!GenerateJwtPrivateKey.instance) {
			GenerateJwtPrivateKey.instance = new GenerateJwtPrivateKey();
		}
		return GenerateJwtPrivateKey.instance;
	}
}

export const generateJwtPrivateKey = GenerateJwtPrivateKey.getInstance();
