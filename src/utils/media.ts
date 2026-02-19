
import { AwsClient } from 'aws4fetch';

export async function listFiles(env: any) {
    // Check for STORAGE binding
    if (!env.STORAGE) {
        console.warn("Missing R2 STORAGE binding");
        return { files: [], error: "Missing R2 STORAGE binding." };
    }

    const publicUrlBase = env.PUBLIC_R2_URL || "";

    try {
        // Native R2 List
        const listing = await env.STORAGE.list({
            limit: 50,
            include: ['customMetadata', 'httpMetadata'],
        });

        // Map R2Objects to our simplified format
        const files = listing.objects.map((obj: any) => ({
            Key: obj.key,
            Size: obj.size,
            LastModified: obj.uploaded,
        }));

        // Sort by date desc (R2 list returns in key order by default, we want by time?)
        // The default list order is lexicographical by key.
        // We can sort manually if needed.
        files.sort((a: any, b: any) => b.LastModified.getTime() - a.LastModified.getTime());

        return { files, error: "", publicUrl: publicUrlBase };

    } catch (e: any) {
        console.error("R2 List Error:", e);
        return { files: [], error: "Could not list R2 Storage. " + e.message, publicUrl: publicUrlBase };
    }
}

export async function deleteFile(env: any, key: string) {
    if (!env.STORAGE) {
        return { error: "Missing R2 STORAGE binding." };
    }

    try {
        await env.STORAGE.delete(key);
        return { success: true };
    } catch (e: any) {
        console.error("R2 Delete Error:", e);
        return { error: "Could not delete file. " + e.message };
    }
}
