const cloudinary = require('cloudinary').v2;
const defaultBanners = require('../Data/banerUrl');
const { runInBackground } = require('./backgroundTasks');

/**
 * Extracts public_id and resource_type info from a Cloudinary URL.
 * e.g., https://res.cloudinary.com/domjlns2q/image/upload/v1717001685/Circle/ukogkxycxtiguvf5hkc8.png
 * e.g., https://res.cloudinary.com/domjlns2q/raw/upload/v1717001685/Circle/doc.pdf
 */
function extractPublicIdAndType(url) {
    if (!url || typeof url !== 'string') return null;
    if (!url.includes('cloudinary.com')) return null;

    try {
        let resourceType = 'image';
        if (url.includes('/raw/upload/')) {
            resourceType = 'raw';
        } else if (url.includes('/video/upload/')) {
            resourceType = 'video';
        }

        const uploadIndex = url.indexOf('/upload/');
        if (uploadIndex === -1) return null;

        let pathAfterUpload = url.substring(uploadIndex + '/upload/'.length);
        // Remove version prefix if present: e.g. v1234567/
        pathAfterUpload = pathAfterUpload.replace(/^v\d+\//, '');

        const lastDotIndex = pathAfterUpload.lastIndexOf('.');
        let idWithoutExt = pathAfterUpload;
        let idWithExt = pathAfterUpload;

        if (lastDotIndex !== -1) {
            idWithoutExt = pathAfterUpload.substring(0, lastDotIndex);
        }

        return {
            publicId: resourceType === 'raw' ? idWithExt : idWithoutExt,
            idWithoutExt,
            idWithExt,
            resourceType
        };
    } catch (e) {
        return null;
    }
}

function extractPublicIdFromUrl(url) {
    const info = extractPublicIdAndType(url);
    return info ? info.publicId : null;
}

/**
 * Direct execution of Cloudinary asset deletion.
 */
async function deleteFromCloudinaryDirect(urlsOrPublicIds) {
    if (!urlsOrPublicIds) return;
    const items = Array.isArray(urlsOrPublicIds) ? urlsOrPublicIds : [urlsOrPublicIds];

    for (const item of items) {
        if (!item) continue;
        let urlStr = typeof item === 'string' ? item : (item.fileUrl || item.url || item.file);
        if (!urlStr || typeof urlStr !== 'string') continue;

        // Skip default stock banners
        if (defaultBanners && defaultBanners.includes(urlStr)) {
            continue;
        }

        // Skip dicebear / ui-avatars / external non-cloudinary urls
        if (!urlStr.includes('cloudinary.com') && !urlStr.startsWith('Circle/')) {
            continue;
        }

        const info = extractPublicIdAndType(urlStr);
        const primaryId = info ? info.publicId : urlStr;
        const idWithoutExt = info ? info.idWithoutExt : urlStr;
        const idWithExt = info ? info.idWithExt : urlStr;

        try {
            // 1. Try primary resource type
            let res = await cloudinary.uploader.destroy(primaryId, { 
                resource_type: info ? info.resourceType : 'image' 
            });

            // 2. If not ok, try as image without extension
            if (res?.result !== 'ok' && res?.result !== 'not found') {
                res = await cloudinary.uploader.destroy(idWithoutExt, { resource_type: 'image' });
            }

            // 3. If still not ok, try as raw with extension
            if (res?.result !== 'ok') {
                res = await cloudinary.uploader.destroy(idWithExt, { resource_type: 'raw' });
            }

            // 4. If still not ok, try as raw without extension
            if (res?.result !== 'ok') {
                res = await cloudinary.uploader.destroy(idWithoutExt, { resource_type: 'raw' });
            }

            // 5. If still not ok, try as video
            if (res?.result !== 'ok') {
                await cloudinary.uploader.destroy(idWithoutExt, { resource_type: 'video' });
            }
        } catch (err) {
            console.error(`[Cloudinary] Failed to delete asset ${urlStr}:`, err.message);
        }
    }
}

/**
 * Automatically runs Cloudinary deletion in background task queue.
 * Returns immediately without blocking the event loop or delaying HTTP responses.
 */
function deleteFromCloudinary(urlsOrPublicIds) {
    if (!urlsOrPublicIds) return Promise.resolve();
    // Copy array or string reference
    const items = Array.isArray(urlsOrPublicIds) ? [...urlsOrPublicIds] : urlsOrPublicIds;
    
    runInBackground('Cloudinary Deletion', async () => {
        await deleteFromCloudinaryDirect(items);
    });

    return Promise.resolve();
}

module.exports = {
    deleteFromCloudinary,
    deleteFromCloudinaryDirect,
    extractPublicIdFromUrl,
    extractPublicIdAndType
};
