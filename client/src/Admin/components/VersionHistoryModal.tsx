/**
 * Version History Modal
 * 
 * Displays a list of configuration snapshots with options to:
 * - Create new snapshots
 * - Download current config as JSON
 * - Preview/compare snapshots
 * - Delete snapshots
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  IconButton,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Chip,
  TextField,
  CircularProgress,
  Alert,
  Tooltip,
  Divider,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import AddIcon from '@mui/icons-material/Add';
import DownloadIcon from '@mui/icons-material/Download';
import VisibilityIcon from '@mui/icons-material/Visibility';
import DeleteIcon from '@mui/icons-material/Delete';
import HistoryIcon from '@mui/icons-material/History';
import AutorenewIcon from '@mui/icons-material/Autorenew';
import RestoreIcon from '@mui/icons-material/Restore';

import {
  listSnapshots,
  createSnapshot,
  deleteSnapshot,
  downloadCurrentConfig,
  getSnapshot,
  type SnapshotMeta,
  type ConfigSnapshot,
} from '../../services/snapshot.api';

interface VersionHistoryModalProps {
  open: boolean;
  onClose: () => void;
  onSelectSnapshot: (snapshot: ConfigSnapshot) => void;
}

export function VersionHistoryModal({
  open,
  onClose,
  onSelectSnapshot,
}: VersionHistoryModalProps) {
  const [snapshots, setSnapshots] = useState<SnapshotMeta[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [newSnapshotName, setNewSnapshotName] = useState('');
  const [showNameInput, setShowNameInput] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [loadingSnapshotId, setLoadingSnapshotId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Load snapshots when modal opens
  const loadSnapshots = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await listSnapshots();
      setSnapshots(result.snapshots);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load snapshots');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (open) {
      loadSnapshots();
    }
  }, [open, loadSnapshots]);

  // Create new snapshot
  const handleCreate = async () => {
    if (creating) return;
    setCreating(true);
    setError(null);
    try {
      await createSnapshot(newSnapshotName || undefined, 'manual');
      setNewSnapshotName('');
      setShowNameInput(false);
      await loadSnapshots();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create snapshot');
    } finally {
      setCreating(false);
    }
  };

  // Download current config
  const handleDownload = async () => {
    if (downloading) return;
    setDownloading(true);
    setError(null);
    try {
      await downloadCurrentConfig();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to download configuration');
    } finally {
      setDownloading(false);
    }
  };

  // Preview a snapshot
  const handlePreview = async (id: string) => {
    if (loadingSnapshotId) return;
    setLoadingSnapshotId(id);
    setError(null);
    try {
      const snapshot = await getSnapshot(id);
      onSelectSnapshot(snapshot);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load snapshot');
    } finally {
      setLoadingSnapshotId(null);
    }
  };

  // Delete a snapshot
  const handleDelete = async (id: string) => {
    if (deletingId) return;
    if (!window.confirm('Are you sure you want to delete this snapshot? This cannot be undone.')) {
      return;
    }
    setDeletingId(id);
    setError(null);
    try {
      await deleteSnapshot(id);
      await loadSnapshots();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete snapshot');
    } finally {
      setDeletingId(null);
    }
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  // Get trigger icon and color
  const getTriggerInfo = (trigger: string) => {
    switch (trigger) {
      case 'manual':
        return { icon: <HistoryIcon fontSize="small" />, label: 'Manual', color: 'primary' as const };
      case 'auto':
        return { icon: <AutorenewIcon fontSize="small" />, label: 'Auto', color: 'default' as const };
      case 'pre-restore':
        return { icon: <RestoreIcon fontSize="small" />, label: 'Pre-restore', color: 'warning' as const };
      default:
        return { icon: <HistoryIcon fontSize="small" />, label: trigger, color: 'default' as const };
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          bgcolor: 'rgba(21, 24, 33, 0.95)',
          backdropFilter: 'blur(12px)',
          color: 'white',
          minHeight: '60vh',
        },
      }}
    >
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <HistoryIcon />
          <Typography variant="h6">Version History</Typography>
        </Box>
        <IconButton onClick={onClose} sx={{ color: 'rgba(255,255,255,0.7)' }}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers sx={{ borderColor: 'rgba(255,255,255,0.1)' }}>
        {/* Action buttons */}
        <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
          {showNameInput ? (
            <Box sx={{ display: 'flex', gap: 1, flex: 1 }}>
              <TextField
                size="small"
                placeholder="Snapshot name (optional)"
                value={newSnapshotName}
                onChange={(e) => setNewSnapshotName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
                sx={{
                  flex: 1,
                  '& .MuiOutlinedInput-root': {
                    color: 'white',
                    '& fieldset': { borderColor: 'rgba(255,255,255,0.3)' },
                    '&:hover fieldset': { borderColor: 'rgba(255,255,255,0.5)' },
                  },
                  '& .MuiInputBase-input::placeholder': {
                    color: 'rgba(255,255,255,0.5)',
                  },
                }}
              />
              <Button
                variant="contained"
                onClick={handleCreate}
                disabled={creating}
                startIcon={creating ? <CircularProgress size={16} /> : <AddIcon />}
              >
                Create
              </Button>
              <Button
                variant="outlined"
                onClick={() => {
                  setShowNameInput(false);
                  setNewSnapshotName('');
                }}
                sx={{ color: 'white', borderColor: 'rgba(255,255,255,0.3)' }}
              >
                Cancel
              </Button>
            </Box>
          ) : (
            <>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => setShowNameInput(true)}
              >
                Create Snapshot
              </Button>
              <Button
                variant="outlined"
                startIcon={downloading ? <CircularProgress size={16} /> : <DownloadIcon />}
                onClick={handleDownload}
                disabled={downloading}
                sx={{ color: 'white', borderColor: 'rgba(255,255,255,0.3)' }}
              >
                Download JSON
              </Button>
            </>
          )}
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        <Divider sx={{ borderColor: 'rgba(255,255,255,0.1)', mb: 2 }} />

        {/* Snapshots list */}
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress />
          </Box>
        ) : snapshots.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Typography color="text.secondary" sx={{ color: 'rgba(255,255,255,0.5)' }}>
              No snapshots yet. Create one to save the current configuration.
            </Typography>
          </Box>
        ) : (
          <List sx={{ py: 0 }}>
            {snapshots.map((snapshot, index) => {
              const triggerInfo = getTriggerInfo(snapshot.trigger);
              const isLoading = loadingSnapshotId === snapshot._id;
              const isDeleting = deletingId === snapshot._id;

              return (
                <React.Fragment key={snapshot._id}>
                  {index > 0 && <Divider sx={{ borderColor: 'rgba(255,255,255,0.05)' }} />}
                  <ListItem
                    sx={{
                      py: 2,
                      '&:hover': { bgcolor: 'rgba(255,255,255,0.03)' },
                    }}
                  >
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Typography variant="body1" sx={{ fontWeight: 500 }}>
                            {formatDate(snapshot.createdAt)}
                          </Typography>
                          <Chip
                            icon={triggerInfo.icon}
                            label={triggerInfo.label}
                            size="small"
                            color={triggerInfo.color}
                            variant="outlined"
                            sx={{ height: 24 }}
                          />
                        </Box>
                      }
                      secondary={
                        snapshot.name ? (
                          <Typography
                            variant="body2"
                            sx={{ color: 'rgba(255,255,255,0.6)', mt: 0.5 }}
                          >
                            "{snapshot.name}"
                          </Typography>
                        ) : null
                      }
                    />
                    <ListItemSecondaryAction>
                      <Tooltip title="Preview & Compare">
                        <IconButton
                          onClick={() => handlePreview(snapshot._id)}
                          disabled={isLoading || isDeleting}
                          sx={{ color: 'rgba(255,255,255,0.7)' }}
                        >
                          {isLoading ? (
                            <CircularProgress size={20} />
                          ) : (
                            <VisibilityIcon />
                          )}
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete">
                        <IconButton
                          onClick={() => handleDelete(snapshot._id)}
                          disabled={isLoading || isDeleting}
                          sx={{ color: 'rgba(255,255,255,0.5)' }}
                        >
                          {isDeleting ? (
                            <CircularProgress size={20} />
                          ) : (
                            <DeleteIcon />
                          )}
                        </IconButton>
                      </Tooltip>
                    </ListItemSecondaryAction>
                  </ListItem>
                </React.Fragment>
              );
            })}
          </List>
        )}
      </DialogContent>

      <DialogActions sx={{ borderTop: '1px solid rgba(255,255,255,0.1)', px: 3, py: 2 }}>
        <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.4)', flex: 1 }}>
          {snapshots.length} snapshot{snapshots.length !== 1 ? 's' : ''} saved
        </Typography>
        <Button onClick={onClose} sx={{ color: 'rgba(255,255,255,0.7)' }}>
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default VersionHistoryModal;
