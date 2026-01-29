import { defineAction, ActionError } from 'astro:actions';
import { z } from 'astro:schema';
import { deleteFile } from '../utils/media';
import { Buffer } from 'node:buffer';

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
            const sharp = (await import('sharp')).default;

            const r2 = new AwsClient({
                accessKeyId: env.R2_ACCESS_KEY as string,
                secretAccessKey: env.R2_SECRET_KEY as string,
                service: 's3',
                region: 'auto',
            });

            // Process uploads
            await Promise.all(filesToUpload.map(async (file) => {
                try {
                    let buffer: ArrayBuffer | Uint8Array = await file.arrayBuffer();
                    let contentType = file.type;
                    let filename = file.name;

                    // Check if it's an image and convert to WebP
                    if (file.type.startsWith('image/')) {
                        try {
                            const imageBuffer = Buffer.from(buffer);
                            const processedBuffer = await sharp(imageBuffer)
                                .webp({ quality: 80 })
                                .toBuffer();

                            // Convert back to Uint8Array/ArrayBuffer for aws4fetch
                            buffer = new Uint8Array(processedBuffer);

                            contentType = 'image/webp';
                            // Replace extension with .webp
                            filename = filename.replace(/\.[^/.]+$/, "") + ".webp";
                        } catch (err) {
                            console.error(`Failed to convert ${file.name} to WebP:`, err);
                            // Fallback to original file if conversion fails
                        }
                    }

                    const key = `${Date.now()}-${filename.replace(/\s+/g, '-')}`;
                    let url = env.R2_ENDPOINT as string;
                    if (!url.endsWith('/')) url += '/';
                    url += `astro-agency-starter-bucket/${key}`;

                    const response = await r2.fetch(url, {
                        method: 'PUT',
                        body: buffer as any,
                        headers: { 'Content-Type': contentType },
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
