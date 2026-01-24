
import { AwsClient } from 'aws4fetch';

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
        const r2 = new AwsClient({
            accessKeyId,
            secretAccessKey,
            service: 's3',
            region: 'auto',
        });

        // Parse bucket name from endpoint or config. 
        // Note: R2 endpoints are usually https://<accountid>.r2.cloudflarestorage.com
        // We need to form the URL: https://<endpoint>/<bucket>
        // But for S3 ListObjects, we can just use the endpoint if it includes the bucket?
        // No, standard S3 SDK takes Bucket param. aws4fetch needs full URL.
        // Assuming R2_ENDPOINT is the base URL (account level).
        // Using path-style access for R2: https://<accountid>.r2.cloudflarestorage.com/<bucket>

        let url = endpoint;
        if (!url.endsWith('/')) url += '/';
        url += 'astro-agency-starter-bucket?list-type=2&max-keys=50'; // ListObjectsV2

        const response = await r2.fetch(url);

        if (!response.ok) {
            const text = await response.text();
            throw new Error(`R2 Error ${response.status}: ${text}`);
        }

        // aws4fetch returns raw XML response. We need to parse it.
        // Since we are in a worker, we might not have DOMParser.
        // However, we just need to extract Keys.
        // We can do simple regex parsing for Keys and LastModified to be dependency-free.

        const xml = await response.text();

        // Simple XML parser for ListBucketResult
        const files = [];
        const contentsRegex = /<Contents>(.*?)<\/Contents>/gs;
        let match;
        while ((match = contentsRegex.exec(xml)) !== null) {
            const content = match[1];
            const keyMatch = /<Key>(.*?)<\/Key>/.exec(content);
            const sizeMatch = /<Size>(.*?)<\/Size>/.exec(content);
            const lastModifiedMatch = /<LastModified>(.*?)<\/LastModified>/.exec(content);

            if (keyMatch) {
                files.push({
                    Key: keyMatch[1],
                    Size: sizeMatch ? parseInt(sizeMatch[1]) : 0,
                    LastModified: lastModifiedMatch ? new Date(lastModifiedMatch[1]) : new Date(),
                });
            }
        }

        // Sort by date desc
        files.sort((a, b) => (b.LastModified?.getTime() || 0) - (a.LastModified?.getTime() || 0));

        return { files, error: "", publicUrl };

    } catch (e: any) {
        console.error("R2 List Error:", e);
        return { files: [], error: "Could not connect to R2 Storage. " + e.message, publicUrl };
    }
}
