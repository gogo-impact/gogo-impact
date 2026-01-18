import { Router } from 'express';
import { requireAuth } from '../middleware/authMiddleware.js';
import {
  createSnapshot,
  listSnapshots,
  getSnapshot,
  deleteSnapshot,
  fetchAllSectionData,
  SnapshotTrigger,
} from '../services/snapshotService.js';

const router = Router();

/**
 * GET /api/snapshots
 * List all snapshots (metadata only, paginated)
 */
router.get('/snapshots', requireAuth, async (req, res, next) => {
  try {
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string) || 50));
    const skip = Math.max(0, parseInt(req.query.skip as string) || 0);

    console.log('[snapshots] GET list', { limit, skip });

    const result = await listSnapshots(limit, skip);

    return res.json({
      snapshots: result.snapshots,
      total: result.total,
      limit,
      skip,
    });
  } catch (error) {
    console.error('[snapshots] GET list error', error);
    return next(error);
  }
});

/**
 * POST /api/snapshots
 * Create a new snapshot of current configuration
 */
router.post('/snapshots', requireAuth, async (req, res, next) => {
  try {
    const { name, trigger } = req.body ?? {};

    console.log('[snapshots] POST create', { name, trigger });

    // Validate trigger if provided
    const validTriggers: SnapshotTrigger[] = ['manual', 'auto', 'pre-restore'];
    const snapshotTrigger: SnapshotTrigger = validTriggers.includes(trigger) ? trigger : 'manual';

    const snapshot = await createSnapshot(name, snapshotTrigger);

    return res.status(201).json({ snapshot });
  } catch (error) {
    console.error('[snapshots] POST create error', error);
    return next(error);
  }
});

/**
 * GET /api/snapshots/export
 * Download current configuration as JSON file
 */
router.get('/snapshots/export', requireAuth, async (req, res, next) => {
  try {
    console.log('[snapshots] GET export');

    const data = await fetchAllSectionData();

    const exportData = {
      _meta: {
        version: '1.0',
        exportedAt: new Date().toISOString(),
        type: 'gogo-impact-config',
      },
      ...data,
    };

    const filename = `gogo-impact-config-${new Date().toISOString().split('T')[0]}.json`;

    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

    return res.json(exportData);
  } catch (error) {
    console.error('[snapshots] GET export error', error);
    return next(error);
  }
});

/**
 * GET /api/snapshots/:id
 * Get a single snapshot with full data
 */
router.get('/snapshots/:id', requireAuth, async (req, res, next) => {
  try {
    const { id } = req.params;

    console.log('[snapshots] GET single', { id });

    const snapshot = await getSnapshot(id);

    if (!snapshot) {
      return res.status(404).json({ error: 'Snapshot not found' });
    }

    return res.json({
      snapshot: {
        _id: snapshot._id?.toString(),
        createdAt: snapshot.createdAt,
        name: snapshot.name,
        trigger: snapshot.trigger,
        data: snapshot.data,
      },
    });
  } catch (error) {
    console.error('[snapshots] GET single error', error);
    return next(error);
  }
});

/**
 * DELETE /api/snapshots/:id
 * Delete a snapshot
 */
router.delete('/snapshots/:id', requireAuth, async (req, res, next) => {
  try {
    const { id } = req.params;

    console.log('[snapshots] DELETE', { id });

    const deleted = await deleteSnapshot(id);

    if (!deleted) {
      return res.status(404).json({ error: 'Snapshot not found' });
    }

    return res.json({ success: true });
  } catch (error) {
    console.error('[snapshots] DELETE error', error);
    return next(error);
  }
});

export default router;
