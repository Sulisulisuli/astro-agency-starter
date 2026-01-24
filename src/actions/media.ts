import { defineAction, ActionError } from 'astro:actions';
import { z } from 'astro:schema';
import { deleteFile } from '../utils/media';

export const upload = defineAction({
    accept: 'form',
    input: z.object({
        files: z.array(z.instanceof(File)).optional(),
        // Fallback for single file if needed, but we'll try to enforce 'files' on client
        file: z.instanceof(File).optional(),
    }),
    handler: async (input, context) => {
        const env = context.locals?.runtime?.env || import.meta.env;

        if (!env.R2_ENDPOINT || !env.R2_ACCESS_KEY || !env.R2_SECRET_KEY) {
            throw new ActionError({
                code: 'INTERNAL_SERVER_ERROR',
                message: 'R2 configuration missing',
            });
        }

        // Normalize input
        let filesToUpload: File[] = [];
        if (input.files && Array.isArray(input.files)) {
            filesToUpload = input.files;
        } else if (input.file) {
            filesToUpload = [input.file];
        }

        if (filesToUpload.length === 0) {
            throw new ActionError({
                code: 'BAD_REQUEST',
                message: 'No files provided',
            });
        }

        const uploadedFiles: any[] = [];
        const errors: any[] = [];

        try {
            const { AwsClient } = await import('aws4fetch');
            const r2 = new AwsClient({
                accessKeyId: env.R2_ACCESS_KEY,
                secretAccessKey: env.R2_SECRET_KEY,
                service: 's3',
                region: 'auto',
            });

            // Process uploads
            await Promise.all(filesToUpload.map(async (file) => {
                try {
                    const key = `${Date.now()}-${file.name.replace(/\s+/g, '-')}`;
                    let url = env.R2_ENDPOINT;
                    if (!url.endsWith('/')) url += '/';
                    url += `astro-agency-starter-bucket/${key}`;

                    const response = await r2.fetch(url, {
                        method: 'PUT',
                        body: file,
                        headers: { 'Content-Type': file.type },
                    });

                    if (!response.ok) {
                        throw new Error(`Status ${response.status}`);
                    }

                    const publicUrl = env.PUBLIC_R2_URL
                        ? `${env.PUBLIC_R2_URL}/${key}`
                        : `https://pub-${env.R2_ACCESS_KEY}.r2.dev/${key}`;

                    uploadedFiles.push({ key, url: publicUrl });
                } catch (e: any) {
                    errors.push({ file: file.name, error: e.message });
                }
            }));

            if (errors.length > 0 && uploadedFiles.length === 0) {
                throw new ActionError({
                    code: 'INTERNAL_SERVER_ERROR',
                    message: `Failed to upload files: ${errors.map(e => e.error).join(', ')}`,
                });
            }

            return { success: true, uploaded: uploadedFiles, errors };

        } catch (error: any) {
            console.error('Upload error:', error);
            throw new ActionError({
                code: 'INTERNAL_SERVER_ERROR',
                message: 'System error during upload: ' + error.message,
            });
        }
    },
});

export const remove = defineAction({
    accept: 'form',
    input: z.object({
        key: z.string(),
    }),
    handler: async ({ key }, context) => {
        const env = context.locals?.runtime?.env || import.meta.env;
        const result = await deleteFile(env, key);

        if (result.error) {
            throw new ActionError({
                code: 'INTERNAL_SERVER_ERROR',
                message: result.error,
            });
        }
        return { success: true, key };
    },
});
