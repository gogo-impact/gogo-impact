import { Router } from 'express';
import { getDatabase } from '../config/database.js';
import { requireAuth } from '../middleware/authMiddleware.js';

const router = Router();

router.post('/media', requireAuth, async (req, res) => {
  try {
    const {
      key,
      publicUrl,
      contentType,
      bytes,
      width,
      height,
      duration,
      alt,
      tag,
      entityType,
      entityId,
    } = req.body ?? {};

    if (!key || !publicUrl) {
      return res.status(400).json({ error: 'key and publicUrl are required' });
    }

    console.log('[media] save request', {
      key,
      publicUrl,
      contentType: contentType ?? null,
      bytes: typeof bytes === 'number' ? bytes : null,
      width: typeof width === 'number' ? width : null,
      height: typeof height === 'number' ? height : null,
      duration: typeof duration === 'number' ? duration : null,
      alt: typeof alt === 'string' ? alt : null,
      tag: typeof tag === 'string' ? tag : null,
      entity: entityType && entityId ? { type: entityType, id: String(entityId) } : null,
    });

    const db = await getDatabase();
    const doc = {
      key,
      url: publicUrl,
      contentType: contentType ?? null,
      bytes: typeof bytes === 'number' ? bytes : null,
      width: typeof width === 'number' ? width : null,
      height: typeof height === 'number' ? height : null,
      duration: typeof duration === 'number' ? duration : null,
      alt: typeof alt === 'string' ? alt : null,
      tag: typeof tag === 'string' ? tag : null,
      entity: entityType && entityId ? { type: entityType, id: String(entityId) } : null,
      createdAt: new Date(),
    } as const;

    const result = await db.collection('media').insertOne(doc as any);
    console.log('[media] saved', { id: String(result.insertedId), key, url: publicUrl });
    return res.status(201).json({ id: result.insertedId, data: doc });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('[media] Failed to save media', error);
    return res.status(500).json({ error: 'Failed to save media' });
  }
});

export default router;
