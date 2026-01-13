
export async function listFiles(env: any) {
    const endpoint = env.R2_ENDPOINT || import.meta.env.R2_ENDPOINT;
    const accessKeyId = env.R2_ACCESS_KEY || import.meta.env.R2_ACCESS_KEY;
    const secretAccessKey = env.R2_SECRET_KEY || import.meta.env.R2_SECRET_KEY;
    const publicUrl = env.PUBLIC_R2_URL || import.meta.env.PUBLIC_R2_URL || "";

    if (!endpoint || !accessKeyId || !secretAccessKey) {
        console.warn("Missing R2 credentials");
        return { files: [], error: "Missing R2 credentials configuration." };
    }

    try {
        const { S3Client, ListObjectsV2Command } = await import('@aws-sdk/client-s3');

        const S3 = new S3Client({
            region: 'auto',
            endpoint: endpoint,
            credentials: {
                accessKeyId: accessKeyId,
                secretAccessKey: secretAccessKey,
            },
        });

        const command = new ListObjectsV2Command({
            Bucket: 'astro-agency-starter-bucket',
            MaxKeys: 50
        });
        const response = await S3.send(command);
        const files = response.Contents || [];

        // Sort by date desc
        files.sort((a, b) => (b.LastModified?.getTime() || 0) - (a.LastModified?.getTime() || 0));

        return { files, error: "", publicUrl };

    } catch (e: any) {
        console.error("R2 List Error:", e);
        return { files: [], error: "Could not connect to R2 Storage. " + e.message, publicUrl };
    }
}
