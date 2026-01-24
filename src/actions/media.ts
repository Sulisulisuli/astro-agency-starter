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
            const { AwsClient } = await import('aws4fetch');

            const r2 = new AwsClient({
                accessKeyId: env.R2_ACCESS_KEY,
                secretAccessKey: env.R2_SECRET_KEY,
                service: 's3',
                region: 'auto',
            });

            const key = `${Date.now()}-${file.name.replace(/\s+/g, '-')}`;
            // file is a File object, which has arrayBuffer() method
            // aws4fetch fetch can take BodyInit which includes ArrayBuffer, but let's be safe

            // Construct URL
            let url = env.R2_ENDPOINT;
            if (!url.endsWith('/')) url += '/';
            url += `astro-agency-starter-bucket/${key}`;

            const response = await r2.fetch(url, {
                method: 'PUT',
                body: file, // File object works directly in fetch
                headers: {
                    'Content-Type': file.type,
                },
            });

            if (!response.ok) {
                const text = await response.text();
                throw new Error(`R2 Upload Error ${response.status}: ${text}`);
            }

            const publicUrl = env.PUBLIC_R2_URL
                ? `${env.PUBLIC_R2_URL}/${key}`
                : `https://pub-${env.R2_ACCESS_KEY}.r2.dev/${key}`;

            return { success: true, url: publicUrl, key };
        } catch (error: any) {
            console.error('Upload error:', error);
            throw new ActionError({
                code: 'INTERNAL_SERVER_ERROR',
                message: 'Failed to upload file to R2: ' + error.message,
            });
        }
    },
});
