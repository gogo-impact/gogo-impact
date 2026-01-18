/**
 * Comparison View Component
 * 
 * Side-by-side comparison of a snapshot vs current configuration.
 * Allows previewing and restoring individual sections.
 */

import React, { useState, useEffect, useMemo, useCallback } from 'react';
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
  ListItemButton,
  ListItemText,
  Chip,
  CircularProgress,
  Alert,
  Divider,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import RestoreIcon from '@mui/icons-material/Restore';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import WarningIcon from '@mui/icons-material/Warning';
import FiberManualRecordIcon from '@mui/icons-material/FiberManualRecord';

import {
  type ConfigSnapshot,
  type ConfigSnapshotData,
  type SectionKey,
  SECTION_KEYS,
  getSectionLabel,
  createSnapshot,
} from '../../services/snapshot.api';

import {
  fetchHeroContent,
  fetchMissionContent,
  fetchDefaults,
  fetchPopulationContent,
  fetchFinancialContent,
  fetchMethodContent,
  fetchCurriculumContent,
  fetchImpactSectionContent,
  fetchHearOurImpactContent,
  fetchTestimonialsContent,
  fetchNationalImpactContent,
  fetchFlexAContent,
  fetchFlexBContent,
  fetchFlexCContent,
  fetchImpactLevelsContent,
  fetchPartnersContent,
  fetchFooterContent,
  saveHeroContent,
  saveMissionContent,
  saveDefaults,
  savePopulationContent,
  saveFinancialContent,
  saveMethodContent,
  saveCurriculumContent,
  saveImpactSectionContent,
  saveHearOurImpactContent,
  saveTestimonialsContent,
  saveNationalImpactContent,
  saveFlexAContent,
  saveFlexBContent,
  saveFlexCContent,
  saveImpactLevelsContent,
  savePartnersContent,
  saveFooterContent,
} from '../../services/impact.api';

// Import section preview components
import HeroSection from '../../components/HeroSection';
import MissionSection from '../../sections/MissionSection';
import Population from '../../components/Population';
import FinancialAnalysisSection from '../../components/FinancialAnalysisSection';
import OurMethodSection from '../../components/OurMethodSection';
import CurriculumSection from '../../components/CurriculumSection';
import ImpactSection from '../../components/ImpactSection';
import SpotifyEmbedsSection from '../../components/SpotifyEmbedsSection';
import SingleQuoteSection from '../../components/SingleQuoteSection';
import LocationsSection from '../../sections/LocationsSection';
import FlexA from '../../components/FlexA';
import FlexB from '../../components/FlexB';
import FlexC from '../../components/FlexC';
import ImpactLevelsSection from '../../components/ImpactLevelsSection';
import PartnersSection from '../../components/PartnersSection';
import FooterSection from '../../components/FooterSection';

interface ComparisonViewProps {
  open: boolean;
  onClose: () => void;
  snapshot: ConfigSnapshot;
  currentData: ConfigSnapshotData;
  onRestoreComplete: () => void;
}

// Map section keys to save functions
const SAVE_FUNCTIONS: Record<SectionKey, (data: any) => Promise<any>> = {
  defaults: saveDefaults,
  hero: saveHeroContent,
  mission: saveMissionContent,
  population: savePopulationContent,
  financial: saveFinancialContent,
  method: saveMethodContent,
  curriculum: saveCurriculumContent,
  impactSection: saveImpactSectionContent,
  hearOurImpact: saveHearOurImpactContent,
  testimonials: saveTestimonialsContent,
  nationalImpact: saveNationalImpactContent,
  flexA: saveFlexAContent,
  flexB: saveFlexBContent,
  flexC: saveFlexCContent,
  impactLevels: saveImpactLevelsContent,
  partners: savePartnersContent,
  footer: saveFooterContent,
};

// Fetch all current section data
async function fetchAllCurrentData(): Promise<ConfigSnapshotData> {
  const [
    defaults,
    hero,
    mission,
    population,
    financial,
    method,
    curriculum,
    impactSection,
    hearOurImpact,
    testimonials,
    nationalImpact,
    flexA,
    flexB,
    flexC,
    impactLevels,
    partners,
    footer,
  ] = await Promise.all([
    fetchDefaults(),
    fetchHeroContent(),
    fetchMissionContent(),
    fetchPopulationContent(),
    fetchFinancialContent(),
    fetchMethodContent(),
    fetchCurriculumContent(),
    fetchImpactSectionContent(),
    fetchHearOurImpactContent(),
    fetchTestimonialsContent(),
    fetchNationalImpactContent(),
    fetchFlexAContent(),
    fetchFlexBContent(),
    fetchFlexCContent(),
    fetchImpactLevelsContent(),
    fetchPartnersContent(),
    fetchFooterContent(),
  ]);

  return {
    defaults,
    hero,
    mission,
    population,
    financial,
    method,
    curriculum,
    impactSection,
    hearOurImpact,
    testimonials,
    nationalImpact,
    flexA,
    flexB,
    flexC,
    impactLevels,
    partners,
    footer,
  };
}

// Fixed scale for previews - larger = less zoomed out
const PREVIEW_SCALE = 0.45;
const PREVIEW_WIDTH = 1200; // Smaller base width for better scaling

export function ComparisonView({
  open,
  onClose,
  snapshot,
  onRestoreComplete,
}: Omit<ComparisonViewProps, 'currentData'>) {
  const [selectedSection, setSelectedSection] = useState<SectionKey>('hero');
  const [restoring, setRestoring] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  
  // Confirmation dialog state
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
  } | null>(null);
  
  // Fetch fresh current data
  const [currentData, setCurrentData] = useState<ConfigSnapshotData | null>(null);
  const [loadingCurrent, setLoadingCurrent] = useState(false);

  // Load current data when modal opens
  useEffect(() => {
    if (open && !currentData) {
      setLoadingCurrent(true);
      fetchAllCurrentData()
        .then(setCurrentData)
        .catch((err) => setError(err.message))
        .finally(() => setLoadingCurrent(false));
    }
  }, [open, currentData]);

  // Reset state when modal closes
  useEffect(() => {
    if (!open) {
      setCurrentData(null);
      setError(null);
      setSuccessMessage(null);
      setSelectedSection('hero');
      setConfirmDialog(null);
    }
  }, [open]);

  // Check if a section has changes
  const getSectionDiff = useCallback(
    (key: SectionKey): 'changed' | 'same' | 'missing' => {
      if (!currentData) return 'missing';
      
      const snapshotData = snapshot.data[key];
      const current = currentData[key];

      if (!snapshotData && !current) return 'same';
      if (!snapshotData || !current) return 'missing';

      // Deep compare by JSON stringify
      return JSON.stringify(snapshotData) !== JSON.stringify(current)
        ? 'changed'
        : 'same';
    },
    [snapshot.data, currentData]
  );

  // Get changed sections
  const changedSections = useMemo(() => {
    if (!currentData) return [];
    return SECTION_KEYS.filter((key) => getSectionDiff(key) === 'changed');
  }, [getSectionDiff, currentData]);

  // Show confirmation dialog
  const showConfirm = (title: string, message: string, onConfirm: () => void) => {
    setConfirmDialog({ open: true, title, message, onConfirm });
  };

  // Restore a single section
  const handleRestoreSection = async (key: SectionKey) => {
    if (restoring) return;

    const snapshotData = snapshot.data[key];
    if (!snapshotData) {
      setError(`No data for ${getSectionLabel(key)} in this snapshot`);
      return;
    }

    showConfirm(
      `Restore ${getSectionLabel(key)}?`,
      `This will replace the current ${getSectionLabel(key)} with the version from this snapshot. A backup will be created first.`,
      async () => {
        setConfirmDialog(null);
        setRestoring(true);
        setError(null);
        setSuccessMessage(null);

        try {
          // Create pre-restore backup
          await createSnapshot(`Before restoring ${getSectionLabel(key)}`, 'pre-restore');

          // Restore the section
          const saveFunction = SAVE_FUNCTIONS[key];
          await saveFunction(snapshotData);

          setSuccessMessage(`${getSectionLabel(key)} restored successfully!`);
          
          // Refresh current data
          const freshData = await fetchAllCurrentData();
          setCurrentData(freshData);
          
          onRestoreComplete();
        } catch (err) {
          setError(err instanceof Error ? err.message : 'Failed to restore section');
        } finally {
          setRestoring(false);
        }
      }
    );
  };

  // Restore all changed sections
  const handleRestoreAll = async () => {
    if (restoring || changedSections.length === 0) return;

    showConfirm(
      `Restore ${changedSections.length} sections?`,
      `This will restore all changed sections from this snapshot. A backup will be created first.`,
      async () => {
        setConfirmDialog(null);
        setRestoring(true);
        setError(null);
        setSuccessMessage(null);

        try {
          // Create pre-restore backup
          await createSnapshot('Before bulk restore', 'pre-restore');

          // Restore each changed section
          for (const key of changedSections) {
            const snapshotData = snapshot.data[key];
            if (snapshotData) {
              const saveFunction = SAVE_FUNCTIONS[key];
              await saveFunction(snapshotData);
            }
          }

          setSuccessMessage(`${changedSections.length} section(s) restored successfully!`);
          
          // Refresh current data
          const freshData = await fetchAllCurrentData();
          setCurrentData(freshData);
          
          onRestoreComplete();
        } catch (err) {
          setError(err instanceof Error ? err.message : 'Failed to restore sections');
        } finally {
          setRestoring(false);
        }
      }
    );
  };

  // Render section preview
  const renderSectionPreview = (key: SectionKey, data: any) => {
    if (!data) {
      return (
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            height: 200,
            color: 'rgba(255,255,255,0.4)',
          }}
        >
          <Typography>No data available</Typography>
        </Box>
      );
    }

    // Render a simplified preview based on section type
    switch (key) {
      case 'hero':
        return <HeroSection previewMode heroOverride={data} />;
      case 'mission':
        return <MissionSection previewMode missionOverride={data} />;
      case 'population':
        return <Population inline previewMode populationOverride={data} />;
      case 'financial':
        return <FinancialAnalysisSection previewMode financialOverride={data} />;
      case 'method':
        return <OurMethodSection previewMode methodOverride={data} />;
      case 'curriculum':
        return <CurriculumSection previewMode curriculumOverride={data} />;
      case 'impactSection':
        return <ImpactSection previewMode impactSectionOverride={data} />;
      case 'hearOurImpact':
        return <SpotifyEmbedsSection previewMode hearOurImpactOverride={data} />;
      case 'testimonials':
        return <SingleQuoteSection previewMode testimonialsOverride={data} />;
      case 'nationalImpact':
        return <LocationsSection previewMode nationalImpactOverride={data} />;
      case 'flexA':
        return <FlexA previewMode flexAOverride={data} />;
      case 'flexB':
        return <FlexB previewMode flexBOverride={data} />;
      case 'flexC':
        return <FlexC previewMode flexCOverride={data} />;
      case 'impactLevels':
        return <ImpactLevelsSection previewMode impactLevelsOverride={data} />;
      case 'partners':
        return <PartnersSection previewMode partnersOverride={data} />;
      case 'footer':
        return <FooterSection previewMode footerOverride={data} />;
      case 'defaults':
        return (
          <Box sx={{ p: 3, color: 'white', bgcolor: '#0f1118', minHeight: 200 }}>
            <Typography variant="h6" gutterBottom sx={{ mb: 2 }}>
              Default Settings
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {data.sectionOrder && (
                <Box>
                  <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.5)', display: 'block', mb: 0.5 }}>
                    Section Order
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {data.sectionOrder.map((section: string, i: number) => (
                      <Chip
                        key={section}
                        label={`${i + 1}. ${section}`}
                        size="small"
                        sx={{ bgcolor: 'rgba(255,255,255,0.1)', fontSize: '0.7rem' }}
                      />
                    ))}
                  </Box>
                </Box>
              )}
              {data.disabledSections && data.disabledSections.length > 0 && (
                <Box>
                  <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.5)', display: 'block', mb: 0.5 }}>
                    Disabled Sections
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {data.disabledSections.map((section: string) => (
                      <Chip key={section} label={section} size="small" color="error" variant="outlined" sx={{ fontSize: '0.7rem' }} />
                    ))}
                  </Box>
                </Box>
              )}
              {(data.primaryColor || data.secondaryColor) && (
                <Box sx={{ display: 'flex', gap: 3 }}>
                  {data.primaryColor && (
                    <Box>
                      <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.5)', display: 'block', mb: 0.5 }}>
                        Primary
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Box sx={{ width: 20, height: 20, borderRadius: 0.5, bgcolor: data.primaryColor, border: '1px solid rgba(255,255,255,0.2)' }} />
                        <Typography variant="caption">{data.primaryColor}</Typography>
                      </Box>
                    </Box>
                  )}
                  {data.secondaryColor && (
                    <Box>
                      <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.5)', display: 'block', mb: 0.5 }}>
                        Secondary
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Box sx={{ width: 20, height: 20, borderRadius: 0.5, bgcolor: data.secondaryColor, border: '1px solid rgba(255,255,255,0.2)' }} />
                        <Typography variant="caption">{data.secondaryColor}</Typography>
                      </Box>
                    </Box>
                  )}
                </Box>
              )}
            </Box>
          </Box>
        );
      default:
        return null;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  return (
    <>
      <Dialog
        open={open}
        onClose={onClose}
        maxWidth={false}
        fullWidth
        PaperProps={{
          sx: {
            bgcolor: 'rgba(21, 24, 33, 0.98)',
            backdropFilter: 'blur(12px)',
            color: 'white',
            width: '95vw',
            height: '85vh',
            maxWidth: '1600px',
          },
        }}
      >
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', py: 1.5 }}>
          <Box>
            <Typography variant="h6" sx={{ fontSize: '1.1rem' }}>
              Comparing: {snapshot.name || formatDate(snapshot.createdAt)}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 0.5 }}>
              <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.5)' }}>
                {loadingCurrent ? 'Loading...' : `${changedSections.length} section(s) differ`}
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <FiberManualRecordIcon sx={{ fontSize: 8, color: '#ff9800' }} />
                <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.4)' }}>
                  = has changes
                </Typography>
              </Box>
            </Box>
          </Box>
          <IconButton onClick={onClose} sx={{ color: 'rgba(255,255,255,0.7)' }} size="small">
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent
          sx={{
            display: 'flex',
            gap: 1.5,
            p: 1.5,
            overflow: 'hidden',
          }}
        >
          {loadingCurrent ? (
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 1 }}>
              <CircularProgress size={24} />
              <Typography sx={{ ml: 2, fontSize: '0.875rem' }}>Loading current configuration...</Typography>
            </Box>
          ) : (
            <>
              {/* Section selector sidebar */}
              <Box
                sx={{
                  width: 160,
                  flexShrink: 0,
                  borderRight: '1px solid rgba(255,255,255,0.1)',
                  overflowY: 'auto',
                  pr: 1,
                }}
              >
                <List dense sx={{ py: 0 }}>
                  {SECTION_KEYS.map((key) => {
                    const diff = getSectionDiff(key);
                    const isSelected = selectedSection === key;

                    return (
                      <ListItemButton
                        key={key}
                        selected={isSelected}
                        onClick={() => setSelectedSection(key)}
                        sx={{
                          borderRadius: 1,
                          py: 0.5,
                          px: 1,
                          mb: 0.25,
                          '&.Mui-selected': {
                            bgcolor: 'rgba(255,255,255,0.1)',
                          },
                        }}
                      >
                        <ListItemText
                          primary={getSectionLabel(key)}
                          primaryTypographyProps={{
                            variant: 'body2',
                            sx: { fontWeight: isSelected ? 600 : 400, fontSize: '0.8rem' },
                          }}
                        />
                        {diff === 'changed' && (
                          <FiberManualRecordIcon sx={{ fontSize: 8, color: '#ff9800', ml: 0.5 }} />
                        )}
                      </ListItemButton>
                    );
                  })}
                </List>
              </Box>

              {/* Comparison panels */}
              <Box sx={{ flex: 1, display: 'flex', gap: 1.5, overflow: 'hidden' }}>
                {/* Snapshot preview */}
                <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 0.5,
                      mb: 0.5,
                      px: 0.5,
                    }}
                  >
                    <WarningIcon sx={{ color: 'warning.main', fontSize: 14 }} />
                    <Typography variant="caption" sx={{ color: 'warning.main', fontWeight: 500 }}>
                      Snapshot
                    </Typography>
                  </Box>
                  <Box
                    sx={{
                      flex: 1,
                      overflow: 'hidden',
                      border: '1px solid rgba(255,152,0,0.3)',
                      borderRadius: 1,
                      bgcolor: '#0f1118',
                    }}
                  >
                    <Box
                      sx={{
                        width: PREVIEW_WIDTH,
                        transform: `scale(${PREVIEW_SCALE})`,
                        transformOrigin: 'top left',
                        height: `${100 / PREVIEW_SCALE}%`,
                      }}
                    >
                      {renderSectionPreview(selectedSection, snapshot.data[selectedSection])}
                    </Box>
                  </Box>
                </Box>

                {/* Current preview */}
                <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 0.5,
                      mb: 0.5,
                      px: 0.5,
                    }}
                  >
                    <CheckCircleIcon sx={{ color: 'success.main', fontSize: 14 }} />
                    <Typography variant="caption" sx={{ color: 'success.main', fontWeight: 500 }}>
                      Current
                    </Typography>
                  </Box>
                  <Box
                    sx={{
                      flex: 1,
                      overflow: 'hidden',
                      border: '1px solid rgba(76,175,80,0.3)',
                      borderRadius: 1,
                      bgcolor: '#0f1118',
                    }}
                  >
                    <Box
                      sx={{
                        width: PREVIEW_WIDTH,
                        transform: `scale(${PREVIEW_SCALE})`,
                        transformOrigin: 'top left',
                        height: `${100 / PREVIEW_SCALE}%`,
                      }}
                    >
                      {currentData && renderSectionPreview(selectedSection, currentData[selectedSection])}
                    </Box>
                  </Box>
                </Box>
              </Box>
            </>
          )}
        </DialogContent>

        <Divider sx={{ borderColor: 'rgba(255,255,255,0.1)' }} />

        {/* Messages */}
        {(error || successMessage) && (
          <Box sx={{ px: 2, pt: 1 }}>
            {error && (
              <Alert severity="error" onClose={() => setError(null)} sx={{ py: 0 }}>
                {error}
              </Alert>
            )}
            {successMessage && (
              <Alert severity="success" onClose={() => setSuccessMessage(null)} sx={{ py: 0 }}>
                {successMessage}
              </Alert>
            )}
          </Box>
        )}

        <DialogActions sx={{ px: 2, py: 1.5, justifyContent: 'space-between' }}>
          <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.4)' }}>
            Backups are created automatically before restore
          </Typography>
          <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center' }}>
            {changedSections.length > 1 && (
              <Button
                variant="text"
                size="small"
                onClick={handleRestoreAll}
                disabled={restoring || loadingCurrent}
                sx={{ 
                  color: 'rgba(255,255,255,0.5)',
                  fontSize: '0.75rem',
                  textTransform: 'none',
                  '&:hover': { color: 'rgba(255,255,255,0.8)' },
                }}
              >
                Restore all {changedSections.length} changed
              </Button>
            )}
            <Button
              variant="contained"
              size="small"
              startIcon={restoring ? <CircularProgress size={14} color="inherit" /> : <RestoreIcon sx={{ fontSize: 16 }} />}
              onClick={() => handleRestoreSection(selectedSection)}
              disabled={restoring || loadingCurrent || getSectionDiff(selectedSection) !== 'changed'}
              sx={{ 
                bgcolor: '#1976d2',
                '&:hover': { bgcolor: '#1565c0' },
                textTransform: 'none',
              }}
            >
              Restore {getSectionLabel(selectedSection)}
            </Button>
            <Button onClick={onClose} size="small" sx={{ color: 'rgba(255,255,255,0.7)', textTransform: 'none' }}>
              Close
            </Button>
          </Box>
        </DialogActions>
      </Dialog>

      {/* Confirmation Dialog */}
      <Dialog
        open={!!confirmDialog?.open}
        onClose={() => setConfirmDialog(null)}
        PaperProps={{
          sx: {
            bgcolor: 'rgba(21, 24, 33, 0.98)',
            backdropFilter: 'blur(12px)',
            color: 'white',
            minWidth: 350,
          },
        }}
      >
        <DialogTitle sx={{ pb: 1 }}>
          {confirmDialog?.title}
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)' }}>
            {confirmDialog?.message}
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button 
            onClick={() => setConfirmDialog(null)} 
            sx={{ color: 'rgba(255,255,255,0.7)', textTransform: 'none' }}
          >
            Cancel
          </Button>
          <Button 
            variant="contained" 
            onClick={confirmDialog?.onConfirm}
            sx={{ bgcolor: '#1976d2', '&:hover': { bgcolor: '#1565c0' }, textTransform: 'none' }}
          >
            Restore
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

export default ComparisonView;
