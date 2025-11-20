import { Router } from 'express';
import crypto from 'node:crypto';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { requireAuth } from '../middleware/authMiddleware.js';

const router = Router();

const requiredEnv = ['AWS_REGION', 'S3_BUCKET', 'CDN_BASE_URL'];
for (const key of requiredEnv) {
  if (!process.env[key]) {
    // eslint-disable-next-line no-console
    console.warn(`[uploads] Missing env var ${key}. Upload signing may fail.`);
  }
}

const s3 = new S3Client({
  region: process.env.AWS_REGION ?? 'us-east-1',
});

interface SignUploadRequestBody {
  contentType: string;
  extension?: string;
  folder?: string;
  key?: string; // optional explicit object key to support versioned overwrites
}

router.post('/uploads/sign', requireAuth, async (req, res) => {
  try {
    const { contentType, extension, folder, key: providedKey }: SignUploadRequestBody = req.body ?? {};
    if (!contentType) {
      return res.status(400).json({ error: 'contentType is required' });
    }

    // Observability: log incoming request metadata
    // Note: do NOT log the signed uploadUrl itself
    console.log('[uploads] sign request', {
      contentType,
      extension,
      folder,
      providedKey: providedKey ?? null,
    });

    // If caller provides a key, sanitize and use it (enables S3 object versioning via stable keys)
    // Otherwise, generate a dated UUID key as before
    let key: string;
    if (providedKey && typeof providedKey === 'string') {
      const safeKey = providedKey.replace(/[^a-zA-Z0-9/_\.-]/g, '');
      if (!safeKey || safeKey.startsWith('/')) {
        return res.status(400).json({ error: 'Invalid key' });
      }
      key = safeKey;
    } else {
      const datePrefix = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
      const safeExt = (extension ?? '').replace(/[^a-zA-Z0-9]/g, '') || inferExtensionFromContentType(contentType) || 'bin';
      const baseFolder = folder?.replace(/[^a-zA-Z0-9/_-]/g, '') || 'media';
      key = `${baseFolder}/${datePrefix}/${crypto.randomUUID()}.${safeExt}`;
    }

    console.log('[uploads] key generated', { key, contentType });

    const command = new PutObjectCommand({
      Bucket: process.env.S3_BUCKET as string,
      Key: key,
      ContentType: contentType,
    });

    const uploadUrl = await getSignedUrl(s3, command, { expiresIn: 60 });
    const publicUrlBase = process.env.CDN_BASE_URL ?? `https://${process.env.S3_BUCKET}.s3.amazonaws.com`;

    console.log('[uploads] sign success', { key, expiresInSeconds: 60, publicUrlBase });

    return res.json({
      uploadUrl,
      key,
      publicUrl: `${publicUrlBase}/${key}`,
      expiresInSeconds: 60,
    });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('[uploads] Failed to sign upload', error);
    return res.status(500).json({ error: 'Failed to sign upload' });
  }
});

function inferExtensionFromContentType(contentType: string | undefined): string | null {
  if (!contentType) return null;
  const map: Record<string, string> = {
    'image/jpeg': 'jpg',
    'image/jpg': 'jpg',
    'image/png': 'png',
    'image/webp': 'webp',
    'image/avif': 'avif',
    'image/gif': 'gif',
    'video/mp4': 'mp4',
    'video/quicktime': 'mov',
    'video/webm': 'webm',
  };
  return map[contentType] ?? null;
}

export default router;
