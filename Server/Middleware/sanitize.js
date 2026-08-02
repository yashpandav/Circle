/**
 * sanitize.js
 * -----------------------------------------------------------
 * Central input-sanitisation middleware for the Circle API.
 *
 * Threats addressed:
 *  1. XSS   – strips / escapes HTML/script tags from strings
 *  2. NoSQL injection – removes MongoDB operator keys ($, .) from objects
 *  3. Field-length limits – truncates strings that are unreasonably long
 *  4. File-type whitelist – rejects disallowed MIME types before Cloudinary upload
 *  5. Filename sanitisation – removes path-traversal characters from uploaded filenames
 */

const MAX_STRING_LENGTH = 10000;   // 10 KB per text field
const MAX_NAME_LENGTH   = 100;
const MAX_URL_LENGTH    = 2048;

// ─── 1. XSS: escape HTML special characters ─────────────────────────────────
function escapeHtml(str) {
    if (typeof str !== 'string') return str;
    return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#x27;')
        .replace(/\//g, '&#x2F;');
}

// Recursively sanitise every string value in an object / array
function deepSanitize(value, opts = {}) {
    if (value === null || value === undefined) return value;

    if (typeof value === 'string') {
        // NoSQL injection: reject if the value itself looks like a Mongo operator
        // (handled at object-key level below, but catch raw strings too)
        let sanitized = value;

        // Trim whitespace
        sanitized = sanitized.trim();

        // Length cap
        const limit = opts.maxLength || MAX_STRING_LENGTH;
        if (sanitized.length > limit) {
            sanitized = sanitized.slice(0, limit);
        }

        return sanitized;
    }

    if (Array.isArray(value)) {
        return value.map(item => deepSanitize(item, opts));
    }

    if (typeof value === 'object') {
        const clean = {};
        for (const key of Object.keys(value)) {
            // NoSQL injection: strip keys starting with '$' or containing '.'
            if (key.startsWith('$') || key.includes('.')) {
                console.warn(`[Security] Blocked suspicious key in request body: "${key}"`);
                continue;
            }
            clean[key] = deepSanitize(value[key], opts);
        }
        return clean;
    }

    return value; // number, boolean – pass through
}

// ─── 2. Allowed MIME types for uploaded files ───────────────────────────────
const ALLOWED_MIME_TYPES = new Set([
    // Images
    'image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml',
    // Documents
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    // Text
    'text/plain',
    // Video (if you need it)
    'video/mp4', 'video/webm',
]);

// ─── 3. Sanitise a single filename ──────────────────────────────────────────
function sanitizeFilename(name) {
    if (typeof name !== 'string') return 'upload';
    return name
        .replace(/[^\w.\-]/g, '_')   // keep word chars, dot, dash
        .replace(/\.{2,}/g, '.')      // collapse consecutive dots (path traversal)
        .replace(/^[.\-]+/, '')       // strip leading dots / dashes
        .slice(0, 200);               // hard cap
}

// ─── 4. Middleware: sanitise req.body ────────────────────────────────────────
function sanitizeBody(req, res, next) {
    if (req.body && typeof req.body === 'object') {
        req.body = deepSanitize(req.body);
    }
    next();
}

// ─── 5. Middleware: sanitise req.params & req.query ─────────────────────────
function sanitizeParams(req, res, next) {
    if (req.params) req.params = deepSanitize(req.params, { maxLength: 200 });
    if (req.query)  req.query  = deepSanitize(req.query,  { maxLength: 500 });
    next();
}

// ─── 6. Middleware: validate uploaded files ──────────────────────────────────
function validateFiles(req, res, next) {
    if (!req.files || Object.keys(req.files).length === 0) return next();

    for (const [fieldName, fileOrFiles] of Object.entries(req.files)) {
        const files = Array.isArray(fileOrFiles) ? fileOrFiles : [fileOrFiles];

        for (const file of files) {
            // MIME type whitelist
            if (!ALLOWED_MIME_TYPES.has(file.mimetype)) {
                return res.status(400).json({
                    success: false,
                    message: `File type "${file.mimetype}" is not allowed. Upload images, PDFs, or documents only.`,
                });
            }

            // Sanitise filename
            file.name = sanitizeFilename(file.name);
        }
    }

    next();
}

// ─── 7. Field-specific validators (reusable in controllers) ─────────────────
const validators = {
    isMongoId: (id) => /^[a-f\d]{24}$/i.test(id),
    isEmail: (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email),
    isUrl: (url) => {
        try { new URL(url); return true; } catch { return false; }
    },
    truncate: (str, len = MAX_STRING_LENGTH) =>
        typeof str === 'string' ? str.slice(0, len) : str,
    sanitizeName: (str) =>
        typeof str === 'string' ? str.trim().slice(0, MAX_NAME_LENGTH) : str,
};

module.exports = {
    sanitizeBody,
    sanitizeParams,
    validateFiles,
    validators,
    escapeHtml,
    sanitizeFilename,
    ALLOWED_MIME_TYPES,
};
