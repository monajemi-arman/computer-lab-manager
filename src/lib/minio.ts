import * as Minio from 'minio';
import { waitFor } from "./utils";

class MinioClientWrapper {
    minioClient: Minio.Client;
    minioEndpoint: string = process.env.MINIO_ENDPOINT ?? "localhost";
    minioAccess: string = process.env.MINIO_ROOT_USER ?? '';
    minioSecret: string = process.env.MINIO_ROOT_PASSWORD ?? '';
    bucket = 'main';
    #ready = { bucket: false };

    constructor() {
        if ([this.minioAccess, this.minioSecret].includes(''))
            throw new Error("missing minio access & secret in env");

        this.minioClient = new Minio.Client({
            endPoint: this.minioEndpoint,
            port: 9000,
            useSSL: false,
            accessKey: this.minioAccess,
            secretKey: this.minioSecret,
        })

        this.ensureBucket();
    }

    async ensureBucket() {
        if (!await this.minioClient.bucketExists(this.bucket))
            await this.minioClient.makeBucket(this.bucket, 'us-east-1')

        this.#ready.bucket = true;
    }

    get ready() {
        return Object.values(this.#ready).some((x) => !!x);
    }

    async getClient() {
        await waitFor(() => !!this.ready);
        return this.minioClient;
    }
}

export const minioClientWrapper = new MinioClientWrapper();