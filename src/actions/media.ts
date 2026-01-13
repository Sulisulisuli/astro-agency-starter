import { defineAction, ActionError } from 'astro:actions';
import { z } from 'astro:schema';

export const upload = defineAction({
    accept: 'form',
    input: z.object({
        file: z.instanceof(File), // Ensure 'File' is available in global scope (Node 20+ / CF)
    }),
    handler: async ({ file }, context) => {
        // Determine environment variables source
        // On Cloudflare Pages, envs are in context.locals.runtime.env
        // locally, process.env or import.meta.env depending on setup
        const env = context.locals?.runtime?.env || import.meta.env;

        if (!env.R2_ENDPOINT || !env.R2_ACCESS_KEY || !env.R2_SECRET_KEY) {
            throw new ActionError({
                code: 'INTERNAL_SERVER_ERROR',
                message: 'R2 configuration missing',
            });
        }

        try {
            const { S3Client, PutObjectCommand } = await import('@aws-sdk/client-s3');

            const S3 = new S3Client({
                region: 'auto',
                endpoint: env.R2_ENDPOINT,
                credentials: {
                    accessKeyId: env.R2_ACCESS_KEY,
                    secretAccessKey: env.R2_SECRET_KEY,
                },
            });

            const key = `${Date.now()}-${file.name.replace(/\s+/g, '-')}`;
            const buffer = await file.arrayBuffer();

            await S3.send(new PutObjectCommand({
                Bucket: 'astro-agency-starter-bucket', // Hardcoded or from env
                Key: key,
                Body: new Uint8Array(buffer),
                ContentType: file.type,
            }));

            const publicUrl = env.PUBLIC_R2_URL
                ? `${env.PUBLIC_R2_URL}/${key}`
                : `https://pub-${env.R2_ACCESS_KEY}.r2.dev/${key}`; // Fallback if needed, but best to force env

            return { success: true, url: publicUrl, key };
        } catch (error) {
            console.error('Upload error:', error);
            throw new ActionError({
                code: 'INTERNAL_SERVER_ERROR',
                message: 'Failed to upload file to R2',
            });
        }
    },
});
