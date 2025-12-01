import React, { useState, useRef } from 'react';
import {
  Grid,
  Box,
  Typography,
  Button,
  Divider,
  IconButton,
  Alert,
  CircularProgress,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import ColorPickerPopover from '../../components/ColorPickerPopover';
import { IconSelector } from '../../components/IconSelector';
import { CustomTextField } from '../styles';
import { GradientEditor, parseGradientString, composeGradient } from './GradientEditor';
import {
  ImpactSectionContent,
  ImpactTurntableStat,
  ImpactHighlightChip,
  ImpactHighlightCard,
  ImpactMethodItem,
  ImpactToolItem,
} from '../../services/impact.api';
import { uploadFile } from '../../services/upload.api';

export interface ImpactSectionTabEditorProps {
  impactSection: ImpactSectionContent;
  defaultSwatch: string[] | null;
  onImpactSectionChange: (field: keyof ImpactSectionContent, value: any) => void;
}

type ImpactColorPickerField =
  | 'statsTitleColor'
  | 'turntableCardBorderColor'
  | 'statCaptionColor'
  | 'highlightsTitleColor'
  | 'highlightsSubtitleColor'
  | 'highlightChipBgColor'
  | 'highlightChipBorderColor'
  | 'highlightChipTextColor'
  | 'highlightCardBgColor'
  | 'highlightCardBorderColor'
  | 'highlightCardTitleColor'
  | 'highlightCardTextColor'
  | 'measureTitleColor'
  | 'measureTitleHighlightColor'
  | 'measureSubtitleColor'
  // Method card colors
  | 'methodCardTitleColor'
  | 'methodCardBgColor'
  | 'methodCardBorderColor'
  | 'methodItemBgColor'
  | 'methodItemBorderColor'
  | 'methodItemTitleColor'
  | 'methodItemTextColor'
  | 'methodCardFooterTextColor'
  // Tools card colors
  | 'toolsCardTitleColor'
  | 'toolsCardBgColor'
  | 'toolsCardBorderColor'
  | 'toolNameColor'
  | 'toolDescriptionColor'
  | 'toolsFooterTextColor';

export function ImpactSectionTabEditor({
  impactSection,
  defaultSwatch,
  onImpactSectionChange,
}: ImpactSectionTabEditorProps) {
  const [colorPickerAnchor, setColorPickerAnchor] = useState<HTMLElement | null>(null);
  const [colorPickerField, setColorPickerField] = useState<ImpactColorPickerField | null>(null);

  // For turntable stat colors
  const [turntableColorPickerIndex, setTurntableColorPickerIndex] = useState<number | null>(null);
  const [turntableColorPickerType, setTurntableColorPickerType] = useState<'colorA' | 'colorB' | null>(null);

  // State for gradient color picker
  const [gradientPickerAnchor, setGradientPickerAnchor] = useState<HTMLElement | null>(null);
  const [gradientPickerKey, setGradientPickerKey] = useState<'sectionBgGradient' | 'topBorderGradient' | 'turntableCardBgGradient' | 'methodCardAccentGradient' | 'toolIconBgGradient' | null>(null);
  const [gradientPickerColorIndex, setGradientPickerColorIndex] = useState<number>(0);
  const gradientPickerOpen = Boolean(gradientPickerAnchor);

  // Get gradient values (no defaults - data should come from DB)
  const getGradientValue = (key: 'sectionBgGradient' | 'topBorderGradient' | 'turntableCardBgGradient' | 'methodCardAccentGradient' | 'toolIconBgGradient'): string => {
    switch (key) {
      case 'sectionBgGradient':
        return impactSection.sectionBgGradient || '';
      case 'topBorderGradient':
        return impactSection.topBorderGradient || '';
      case 'turntableCardBgGradient':
        return impactSection.turntableCardBgGradient || '';
      case 'methodCardAccentGradient':
        return impactSection.methodCardAccentGradient || '';
      case 'toolIconBgGradient':
        return impactSection.toolIconBgGradient || '';
      default:
        return '';
    }
  };

  const getGradientPickerColor = (): string => {
    if (!gradientPickerKey) return '#000000';
    const gradient = getGradientValue(gradientPickerKey);
    if (!gradient) return '#000000';
    const parsed = parseGradientString(gradient);
    return parsed.colors[gradientPickerColorIndex] || '#000000';
  };

  const openGradientPicker = (el: HTMLElement, key: 'sectionBgGradient' | 'topBorderGradient' | 'turntableCardBgGradient' | 'methodCardAccentGradient' | 'toolIconBgGradient', colorIndex: number) => {
    setGradientPickerKey(key);
    setGradientPickerColorIndex(colorIndex);
    setGradientPickerAnchor(el);
  };

  const handleGradientColorChange = (color: string) => {
    if (!gradientPickerKey) return;
    const currentGradient = getGradientValue(gradientPickerKey);
    if (!currentGradient) {
      const newGradient = `linear-gradient(90deg, ${color}, ${color})`;
      onImpactSectionChange(gradientPickerKey, newGradient);
      return;
    }
    const parsed = parseGradientString(currentGradient);
    const newColors = [...parsed.colors];
    newColors[gradientPickerColorIndex] = color;
    const newGradient = composeGradient(parsed.type, parsed.degree, newColors, parsed.opacity);
    onImpactSectionChange(gradientPickerKey, newGradient);
  };

  const closeGradientPicker = () => {
    setGradientPickerAnchor(null);
    setGradientPickerKey(null);
  };

  // Color picker helpers
  const openColorPicker = (el: HTMLElement, field: ImpactColorPickerField) => {
    setColorPickerField(field);
    setTurntableColorPickerIndex(null);
    setTurntableColorPickerType(null);
    setColorPickerAnchor(el);
  };

  const openTurntableColorPicker = (el: HTMLElement, index: number, type: 'colorA' | 'colorB') => {
    setColorPickerField(null);
    setTurntableColorPickerIndex(index);
    setTurntableColorPickerType(type);
    setColorPickerAnchor(el);
  };

  const handleColorChange = (color: string) => {
    if (colorPickerField) {
      onImpactSectionChange(colorPickerField, color);
    } else if (turntableColorPickerIndex !== null && turntableColorPickerType) {
      const stats = [...turntableStats];
      stats[turntableColorPickerIndex] = { ...stats[turntableColorPickerIndex], [turntableColorPickerType]: color };
      onImpactSectionChange('turntableStats', stats);
    }
  };

  const closeColorPicker = () => {
    setColorPickerAnchor(null);
    setColorPickerField(null);
    setTurntableColorPickerIndex(null);
    setTurntableColorPickerType(null);
  };

  const getColorValue = (field: ImpactColorPickerField): string => {
    return (impactSection[field] as string) || '';
  };

  // Turntable stats helpers
  const turntableStats: ImpactTurntableStat[] = impactSection.turntableStats ?? [];

  const addTurntableStat = () => {
    const newStat: ImpactTurntableStat = {
      id: `stat-${Date.now()}`,
      number: 0,
      label: '',
      colorA: '',
      colorB: '',
    };
    onImpactSectionChange('turntableStats', [...turntableStats, newStat]);
  };

  const updateTurntableStat = (index: number, field: keyof ImpactTurntableStat, value: any) => {
    const updated = [...turntableStats];
    updated[index] = { ...updated[index], [field]: value };
    onImpactSectionChange('turntableStats', updated);
  };

  const removeTurntableStat = (index: number) => {
    const updated = turntableStats.filter((_, i) => i !== index);
    onImpactSectionChange('turntableStats', updated);
  };

  // Highlight chips helpers
  const highlightChips: ImpactHighlightChip[] = impactSection.highlightChips ?? [];

  const addHighlightChip = () => {
    const newChip: ImpactHighlightChip = {
      id: `chip-${Date.now()}`,
      text: '',
      iconKey: '',
    };
    onImpactSectionChange('highlightChips', [...highlightChips, newChip]);
  };

  const updateHighlightChip = (index: number, field: keyof ImpactHighlightChip, value: string) => {
    const updated = [...highlightChips];
    updated[index] = { ...updated[index], [field]: value };
    onImpactSectionChange('highlightChips', updated);
  };

  const removeHighlightChip = (index: number) => {
    const updated = highlightChips.filter((_, i) => i !== index);
    onImpactSectionChange('highlightChips', updated);
  };

  // Highlight cards helpers
  const highlightCards: ImpactHighlightCard[] = impactSection.highlightCards ?? [];

  const addHighlightCard = () => {
    const newCard: ImpactHighlightCard = {
      id: `card-${Date.now()}`,
      title: '',
      text: '',
    };
    onImpactSectionChange('highlightCards', [...highlightCards, newCard]);
  };

  const updateHighlightCard = (index: number, field: keyof ImpactHighlightCard, value: string) => {
    const updated = [...highlightCards];
    updated[index] = { ...updated[index], [field]: value };
    onImpactSectionChange('highlightCards', updated);
  };

  const removeHighlightCard = (index: number) => {
    const updated = highlightCards.filter((_, i) => i !== index);
    onImpactSectionChange('highlightCards', updated);
  };

  // Image carousel helpers
  const topCarouselImages: string[] = impactSection.topCarouselImages ?? [];
  const bottomCarouselImages: string[] = impactSection.bottomCarouselImages ?? [];

  // Track which image is currently uploading
  const [uploadingTop, setUploadingTop] = useState<number | null>(null);
  const [uploadingBottom, setUploadingBottom] = useState<number | null>(null);

  // Drag state for reordering
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const [dragCarousel, setDragCarousel] = useState<'topCarouselImages' | 'bottomCarouselImages' | null>(null);

  // File input refs - one per carousel for adding new images
  const addTopFileInputRef = useRef<HTMLInputElement | null>(null);
  const addBottomFileInputRef = useRef<HTMLInputElement | null>(null);

  // Handle uploading to an existing slot (clicking on a card)
  const handleImageUpload = async (
    carousel: 'topCarouselImages' | 'bottomCarouselImages',
    index: number,
    file: File
  ) => {
    const setUploading = carousel === 'topCarouselImages' ? setUploadingTop : setUploadingBottom;
    setUploading(index);

    try {
      const folder = carousel === 'topCarouselImages' ? 'impact-section/top-carousel' : 'impact-section/bottom-carousel';
      const result = await uploadFile(file, { folder });

      // Get fresh copy of current images and update at index
      const currentImages = carousel === 'topCarouselImages' 
        ? [...(impactSection.topCarouselImages ?? [])]
        : [...(impactSection.bottomCarouselImages ?? [])];
      currentImages[index] = result.publicUrl;
      onImpactSectionChange(carousel, currentImages);
    } catch (error) {
      console.error('Failed to upload image:', error);
    } finally {
      setUploading(null);
    }
  };

  // Handle adding a new empty slot
  const addEmptySlot = (carousel: 'topCarouselImages' | 'bottomCarouselImages') => {
    const currentImages = carousel === 'topCarouselImages' 
      ? [...(impactSection.topCarouselImages ?? [])]
      : [...(impactSection.bottomCarouselImages ?? [])];
    currentImages.push(''); // Add empty placeholder
    onImpactSectionChange(carousel, currentImages);
  };

  // Handle removing an image at a specific index
  const removeCarouselImage = (carousel: 'topCarouselImages' | 'bottomCarouselImages', indexToRemove: number) => {
    const currentImages = carousel === 'topCarouselImages' 
      ? [...(impactSection.topCarouselImages ?? [])]
      : [...(impactSection.bottomCarouselImages ?? [])];
    const updated = currentImages.filter((_, i) => i !== indexToRemove);
    onImpactSectionChange(carousel, updated);
  };

  // Drag and drop handlers
  const handleDragStart = (carousel: 'topCarouselImages' | 'bottomCarouselImages', index: number) => {
    setDraggedIndex(index);
    setDragCarousel(carousel);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    setDragOverIndex(index);
  };

  const handleDragEnd = () => {
    if (draggedIndex !== null && dragOverIndex !== null && dragCarousel && draggedIndex !== dragOverIndex) {
      const currentImages = dragCarousel === 'topCarouselImages' 
        ? [...(impactSection.topCarouselImages ?? [])]
        : [...(impactSection.bottomCarouselImages ?? [])];
      
      // Remove from old position and insert at new position
      const [removed] = currentImages.splice(draggedIndex, 1);
      currentImages.splice(dragOverIndex, 0, removed);
      
      onImpactSectionChange(dragCarousel, currentImages);
    }
    setDraggedIndex(null);
    setDragOverIndex(null);
    setDragCarousel(null);
  };

  const handleDragLeave = () => {
    setDragOverIndex(null);
  };

  // Method items helpers (left column of measurement section)
  const methodItems: ImpactMethodItem[] = impactSection.methodItems ?? [];

  const addMethodItem = () => {
    const newItem: ImpactMethodItem = {
      id: `method-${Date.now()}`,
      iconKey: '',
      title: '',
      text: '',
    };
    onImpactSectionChange('methodItems', [...methodItems, newItem]);
  };

  const updateMethodItem = (index: number, field: keyof ImpactMethodItem, value: string) => {
    const updated = [...methodItems];
    updated[index] = { ...updated[index], [field]: value };
    onImpactSectionChange('methodItems', updated);
  };

  const removeMethodItem = (index: number) => {
    const updated = methodItems.filter((_, i) => i !== index);
    onImpactSectionChange('methodItems', updated);
  };

  // Tool items helpers (right column of measurement section)
  const toolItems: ImpactToolItem[] = impactSection.toolItems ?? [];

  const addToolItem = () => {
    const newItem: ImpactToolItem = {
      id: `tool-${Date.now()}`,
      title: '',
      description: '',
    };
    onImpactSectionChange('toolItems', [...toolItems, newItem]);
  };

  const updateToolItem = (index: number, field: keyof ImpactToolItem, value: string) => {
    const updated = [...toolItems];
    updated[index] = { ...updated[index], [field]: value };
    onImpactSectionChange('toolItems', updated);
  };

  const removeToolItem = (index: number) => {
    const updated = toolItems.filter((_, i) => i !== index);
    onImpactSectionChange('toolItems', updated);
  };

  return (
    <Grid container spacing={3}>
      {/* Color Picker Popover */}
      <ColorPickerPopover
        open={Boolean(colorPickerAnchor)}
        anchorEl={colorPickerAnchor}
        color={
          colorPickerField
            ? getColorValue(colorPickerField)
            : turntableColorPickerIndex !== null && turntableColorPickerType
            ? turntableStats[turntableColorPickerIndex]?.[turntableColorPickerType] || ''
            : ''
        }
        onChange={handleColorChange}
        onClose={closeColorPicker}
        swatches={defaultSwatch ?? undefined}
      />

      {/* Gradient Color Picker Popover */}
      <ColorPickerPopover
        open={gradientPickerOpen}
        anchorEl={gradientPickerAnchor}
        color={getGradientPickerColor()}
        onChange={handleGradientColorChange}
        onClose={closeGradientPicker}
        swatches={defaultSwatch ?? undefined}
      />

      {/* ─────────────────────────────────────────────────────────────────────── */}
      {/* SECTION BACKGROUND */}
      {/* ─────────────────────────────────────────────────────────────────────── */}
      <Grid item xs={12}>
        <Typography variant="h6" sx={{ mb: 2, color: 'rgba(255,255,255,0.9)' }}>
          Section Background
        </Typography>
      </Grid>

      <Grid item xs={12}>
        <GradientEditor
          label="Section Background Gradient"
          value={getGradientValue('sectionBgGradient')}
          onChange={(gradient) => onImpactSectionChange('sectionBgGradient', gradient)}
          showTypeSelector
          showThreeColorToggle
        />
      </Grid>

      <Grid item xs={12}>
        <GradientEditor
          label="Top Border Accent Gradient"
          value={getGradientValue('topBorderGradient')}
          onChange={(gradient) => onImpactSectionChange('topBorderGradient', gradient)}
          showTypeSelector
          showThreeColorToggle
        />
      </Grid>

      {/* ─────────────────────────────────────────────────────────────────────── */}
      {/* TOP IMAGE CAROUSEL */}
      {/* ─────────────────────────────────────────────────────────────────────── */}
      <Grid item xs={12}>
        <Divider sx={{ my: 2, bgcolor: 'rgba(255,255,255,0.1)' }} />
        <Typography variant="h6" sx={{ mb: 1, color: 'rgba(255,255,255,0.9)' }}>
          Top Image Carousel
        </Typography>
        <Alert severity="info" sx={{ mb: 2, bgcolor: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.8)' }}>
          Recommend at least 7 unique images. Drag cards to reorder. Click a card to upload/replace an image.
        </Alert>
      </Grid>

      {topCarouselImages.map((url, idx) => {
        const isUploading = uploadingTop === idx;
        const isDragging = dragCarousel === 'topCarouselImages' && draggedIndex === idx;
        const isDragOver = dragCarousel === 'topCarouselImages' && dragOverIndex === idx;
        const cardId = `top-img-card-${idx}`;
        
        return (
          <Grid item xs={12} sm={6} md={4} key={cardId}>
            <Box
              draggable={!isUploading && !!url}
              onDragStart={() => handleDragStart('topCarouselImages', idx)}
              onDragOver={(e) => handleDragOver(e, idx)}
              onDragLeave={handleDragLeave}
              onDragEnd={handleDragEnd}
              sx={{
                position: 'relative',
                bgcolor: 'rgba(255,255,255,0.03)',
                borderRadius: 2,
                border: isDragOver 
                  ? '2px dashed rgba(30, 215, 96, 0.8)' 
                  : '1px solid rgba(255,255,255,0.08)',
                overflow: 'hidden',
                opacity: isDragging ? 0.5 : 1,
                cursor: url ? 'grab' : 'pointer',
                transition: 'border 0.2s, opacity 0.2s',
                '&:hover': {
                  borderColor: 'rgba(255,255,255,0.2)',
                },
              }}
            >
              {/* Hidden file input for this card */}
              <input
                type="file"
                accept="image/png,image/jpeg,image/webp,image/gif"
                style={{ display: 'none' }}
                id={`top-file-input-${idx}`}
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleImageUpload('topCarouselImages', idx, file);
                  e.target.value = '';
                }}
              />
              
              {/* Clickable image area */}
              <Box
                component="label"
                htmlFor={`top-file-input-${idx}`}
                sx={{
                  display: 'block',
                  cursor: 'pointer',
                  width: '100%',
                  height: 120,
                }}
              >
                {url ? (
                  <Box
                    component="img"
                    src={url}
                    alt={`Top carousel ${idx + 1}`}
                    sx={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      display: 'block',
                      pointerEvents: 'none',
                    }}
                  />
                ) : (
                  <Box
                    sx={{
                      width: '100%',
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      bgcolor: 'rgba(255,255,255,0.02)',
                    }}
                  >
                    {isUploading ? (
                      <CircularProgress size={24} sx={{ color: 'rgba(255,255,255,0.5)' }} />
                    ) : (
                      <>
                        <CloudUploadIcon sx={{ color: 'rgba(255,255,255,0.3)', mb: 0.5 }} />
                        <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.3)' }}>
                          Click to upload
                        </Typography>
                      </>
                    )}
                  </Box>
                )}
              </Box>

              {/* Footer with label and delete */}
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  px: 1,
                  py: 0.5,
                  bgcolor: 'rgba(0,0,0,0.6)',
                }}
              >
                <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                  {idx + 1}
                </Typography>
                <IconButton
                  size="small"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    removeCarouselImage('topCarouselImages', idx);
                  }}
                  disabled={isUploading}
                  sx={{ color: 'rgba(255,255,255,0.5)', p: 0.5 }}
                >
                  <DeleteIcon sx={{ fontSize: 16 }} />
                </IconButton>
              </Box>
            </Box>
          </Grid>
        );
      })}

      <Grid item xs={12}>
        <Button
          startIcon={<AddIcon />}
          onClick={() => addEmptySlot('topCarouselImages')}
          variant="outlined"
          sx={{ borderColor: 'rgba(255,255,255,0.3)', color: 'rgba(255,255,255,0.9)' }}
        >
          Add Image Slot
        </Button>
      </Grid>

      {/* ─────────────────────────────────────────────────────────────────────── */}
      {/* STATS SECTION */}
      {/* ─────────────────────────────────────────────────────────────────────── */}
      <Grid item xs={12}>
        <Divider sx={{ my: 2, bgcolor: 'rgba(255,255,255,0.1)' }} />
        <Typography variant="h6" sx={{ mb: 2, color: 'rgba(255,255,255,0.9)' }}>
          Stats Section (Turntables)
        </Typography>
      </Grid>

      <Grid item xs={12} md={6}>
        <CustomTextField
          label="Stats Title"
          value={impactSection.statsTitle || ''}
          onChange={(e) => onImpactSectionChange('statsTitle', e.target.value)}
          fullWidth
          placeholder="e.g., IN 2024-2025..."
        />
      </Grid>

      <Grid item xs={12}>
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mb: 2 }}>
          <Button
            size="small"
            variant="outlined"
            onClick={(e) => openColorPicker(e.currentTarget, 'statsTitleColor')}
            sx={{ borderColor: 'rgba(255,255,255,0.3)', color: 'rgba(255,255,255,0.9)' }}
          >
            <span style={{ display: 'inline-block', width: 16, height: 16, borderRadius: 3, background: impactSection.statsTitleColor || 'transparent', border: '1px solid rgba(255,255,255,0.2)' }} />
            &nbsp;Title color
          </Button>
          <Button
            size="small"
            variant="outlined"
            onClick={(e) => openColorPicker(e.currentTarget, 'statCaptionColor')}
            sx={{ borderColor: 'rgba(255,255,255,0.3)', color: 'rgba(255,255,255,0.9)' }}
          >
            <span style={{ display: 'inline-block', width: 16, height: 16, borderRadius: 3, background: impactSection.statCaptionColor || 'transparent', border: '1px solid rgba(255,255,255,0.2)' }} />
            &nbsp;Caption color
          </Button>
        </Box>
      </Grid>

      <Grid item xs={12}>
        <GradientEditor
          label="Turntable Card Background"
          value={getGradientValue('turntableCardBgGradient')}
          onChange={(gradient) => onImpactSectionChange('turntableCardBgGradient', gradient)}
          showTypeSelector
        />
      </Grid>

      {/* Turntable Stats List */}
      <Grid item xs={12}>
        <Typography variant="subtitle2" sx={{ mb: 1, color: 'rgba(255,255,255,0.7)' }}>
          Turntable Stats (Records)
        </Typography>
      </Grid>

      {turntableStats.map((stat, idx) => (
        <Grid item xs={12} key={stat.id}>
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              gap: 2,
              p: 2,
              bgcolor: 'rgba(255,255,255,0.03)',
              borderRadius: 2,
              border: '1px solid rgba(255,255,255,0.08)',
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <CustomTextField
                label="Percentage"
                type="number"
                value={stat.number}
                onChange={(e) => updateTurntableStat(idx, 'number', Number(e.target.value))}
                sx={{ width: 120 }}
              />
              <CustomTextField
                label="Label"
                value={stat.label}
                onChange={(e) => updateTurntableStat(idx, 'label', e.target.value)}
                sx={{ flex: 1 }}
                placeholder="e.g., made or maintained academic gains"
              />
              <IconButton
                onClick={() => removeTurntableStat(idx)}
                sx={{ color: 'rgba(255,255,255,0.5)' }}
              >
                <DeleteIcon />
              </IconButton>
            </Box>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button
                size="small"
                variant="outlined"
                onClick={(e) => openTurntableColorPicker(e.currentTarget, idx, 'colorA')}
                sx={{ borderColor: 'rgba(255,255,255,0.3)', color: 'rgba(255,255,255,0.9)' }}
              >
                <span style={{ display: 'inline-block', width: 16, height: 16, borderRadius: 3, background: stat.colorA || 'transparent', border: '1px solid rgba(255,255,255,0.2)' }} />
                &nbsp;Label Color A
              </Button>
              <Button
                size="small"
                variant="outlined"
                onClick={(e) => openTurntableColorPicker(e.currentTarget, idx, 'colorB')}
                sx={{ borderColor: 'rgba(255,255,255,0.3)', color: 'rgba(255,255,255,0.9)' }}
              >
                <span style={{ display: 'inline-block', width: 16, height: 16, borderRadius: 3, background: stat.colorB || 'transparent', border: '1px solid rgba(255,255,255,0.2)' }} />
                &nbsp;Label Color B
              </Button>
            </Box>
          </Box>
        </Grid>
      ))}

      <Grid item xs={12}>
        <Button
          startIcon={<AddIcon />}
          onClick={addTurntableStat}
          variant="outlined"
          sx={{ borderColor: 'rgba(255,255,255,0.3)', color: 'rgba(255,255,255,0.9)' }}
        >
          Add Turntable Stat
        </Button>
      </Grid>

      {/* ─────────────────────────────────────────────────────────────────────── */}
      {/* HIGHLIGHTS SECTION */}
      {/* ─────────────────────────────────────────────────────────────────────── */}
      <Grid item xs={12}>
        <Divider sx={{ my: 2, bgcolor: 'rgba(255,255,255,0.1)' }} />
        <Typography variant="h6" sx={{ mb: 2, color: 'rgba(255,255,255,0.9)' }}>
          Highlights Section
        </Typography>
      </Grid>

      <Grid item xs={12} md={6}>
        <CustomTextField
          label="Highlights Title"
          value={impactSection.highlightsTitle || ''}
          onChange={(e) => onImpactSectionChange('highlightsTitle', e.target.value)}
          fullWidth
          placeholder="e.g., Core Capacities We Build"
        />
      </Grid>

      <Grid item xs={12}>
        <CustomTextField
          label="Highlights Subtitle"
          value={impactSection.highlightsSubtitle || ''}
          onChange={(e) => onImpactSectionChange('highlightsSubtitle', e.target.value)}
          fullWidth
          multiline
          rows={2}
          placeholder="Enter subtitle..."
        />
      </Grid>

      <Grid item xs={12}>
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <Button
            size="small"
            variant="outlined"
            onClick={(e) => openColorPicker(e.currentTarget, 'highlightsTitleColor')}
            sx={{ borderColor: 'rgba(255,255,255,0.3)', color: 'rgba(255,255,255,0.9)' }}
          >
            <span style={{ display: 'inline-block', width: 16, height: 16, borderRadius: 3, background: impactSection.highlightsTitleColor || 'transparent', border: '1px solid rgba(255,255,255,0.2)' }} />
            &nbsp;Title color
          </Button>
          <Button
            size="small"
            variant="outlined"
            onClick={(e) => openColorPicker(e.currentTarget, 'highlightsSubtitleColor')}
            sx={{ borderColor: 'rgba(255,255,255,0.3)', color: 'rgba(255,255,255,0.9)' }}
          >
            <span style={{ display: 'inline-block', width: 16, height: 16, borderRadius: 3, background: impactSection.highlightsSubtitleColor || 'transparent', border: '1px solid rgba(255,255,255,0.2)' }} />
            &nbsp;Subtitle color
          </Button>
        </Box>
      </Grid>

      {/* Highlight Chips */}
      <Grid item xs={12}>
        <Typography variant="subtitle2" sx={{ mb: 1, color: 'rgba(255,255,255,0.7)' }}>
          Highlight Chips
        </Typography>
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mb: 2 }}>
          <Button
            size="small"
            variant="outlined"
            onClick={(e) => openColorPicker(e.currentTarget, 'highlightChipBgColor')}
            sx={{ borderColor: 'rgba(255,255,255,0.3)', color: 'rgba(255,255,255,0.9)' }}
          >
            <span style={{ display: 'inline-block', width: 16, height: 16, borderRadius: 3, background: impactSection.highlightChipBgColor || 'transparent', border: '1px solid rgba(255,255,255,0.2)' }} />
            &nbsp;Chip bg
          </Button>
          <Button
            size="small"
            variant="outlined"
            onClick={(e) => openColorPicker(e.currentTarget, 'highlightChipTextColor')}
            sx={{ borderColor: 'rgba(255,255,255,0.3)', color: 'rgba(255,255,255,0.9)' }}
          >
            <span style={{ display: 'inline-block', width: 16, height: 16, borderRadius: 3, background: impactSection.highlightChipTextColor || 'transparent', border: '1px solid rgba(255,255,255,0.2)' }} />
            &nbsp;Chip text
          </Button>
        </Box>
      </Grid>

      {highlightChips.map((chip, idx) => (
        <Grid item xs={12} key={chip.id}>
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
            <Box sx={{ width: 180 }}>
              <IconSelector
                label="Icon"
                value={chip.iconKey || ''}
                onChange={(key) => updateHighlightChip(idx, 'iconKey', key)}
              />
            </Box>
            <CustomTextField
              label="Text"
              value={chip.text}
              onChange={(e) => updateHighlightChip(idx, 'text', e.target.value)}
              sx={{ flex: 1 }}
              placeholder="e.g., Academic Self-Efficacy"
            />
            <IconButton
              onClick={() => removeHighlightChip(idx)}
              sx={{ color: 'rgba(255,255,255,0.5)' }}
            >
              <DeleteIcon />
            </IconButton>
          </Box>
        </Grid>
      ))}

      <Grid item xs={12}>
        <Button
          startIcon={<AddIcon />}
          onClick={addHighlightChip}
          variant="outlined"
          sx={{ borderColor: 'rgba(255,255,255,0.3)', color: 'rgba(255,255,255,0.9)' }}
        >
          Add Highlight Chip
        </Button>
      </Grid>

      {/* Highlight Cards */}
      <Grid item xs={12}>
        <Typography variant="subtitle2" sx={{ mb: 1, mt: 2, color: 'rgba(255,255,255,0.7)' }}>
          Highlight Cards
        </Typography>
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mb: 2 }}>
          <Button
            size="small"
            variant="outlined"
            onClick={(e) => openColorPicker(e.currentTarget, 'highlightCardBgColor')}
            sx={{ borderColor: 'rgba(255,255,255,0.3)', color: 'rgba(255,255,255,0.9)' }}
          >
            <span style={{ display: 'inline-block', width: 16, height: 16, borderRadius: 3, background: impactSection.highlightCardBgColor || 'transparent', border: '1px solid rgba(255,255,255,0.2)' }} />
            &nbsp;Card bg
          </Button>
          <Button
            size="small"
            variant="outlined"
            onClick={(e) => openColorPicker(e.currentTarget, 'highlightCardTitleColor')}
            sx={{ borderColor: 'rgba(255,255,255,0.3)', color: 'rgba(255,255,255,0.9)' }}
          >
            <span style={{ display: 'inline-block', width: 16, height: 16, borderRadius: 3, background: impactSection.highlightCardTitleColor || 'transparent', border: '1px solid rgba(255,255,255,0.2)' }} />
            &nbsp;Card title
          </Button>
          <Button
            size="small"
            variant="outlined"
            onClick={(e) => openColorPicker(e.currentTarget, 'highlightCardTextColor')}
            sx={{ borderColor: 'rgba(255,255,255,0.3)', color: 'rgba(255,255,255,0.9)' }}
          >
            <span style={{ display: 'inline-block', width: 16, height: 16, borderRadius: 3, background: impactSection.highlightCardTextColor || 'transparent', border: '1px solid rgba(255,255,255,0.2)' }} />
            &nbsp;Card text
          </Button>
        </Box>
      </Grid>

      {highlightCards.map((card, idx) => (
        <Grid item xs={12} key={card.id}>
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              gap: 2,
              p: 2,
              bgcolor: 'rgba(255,255,255,0.03)',
              borderRadius: 2,
              border: '1px solid rgba(255,255,255,0.08)',
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <CustomTextField
                label="Card Title"
                value={card.title}
                onChange={(e) => updateHighlightCard(idx, 'title', e.target.value)}
                sx={{ flex: 1 }}
                placeholder="e.g., Trusting Relationships"
              />
              <IconButton
                onClick={() => removeHighlightCard(idx)}
                sx={{ color: 'rgba(255,255,255,0.5)' }}
              >
                <DeleteIcon />
              </IconButton>
            </Box>
            <CustomTextField
              label="Card Text"
              value={card.text}
              onChange={(e) => updateHighlightCard(idx, 'text', e.target.value)}
              fullWidth
              multiline
              rows={2}
              placeholder="Enter description..."
            />
          </Box>
        </Grid>
      ))}

      <Grid item xs={12}>
        <Button
          startIcon={<AddIcon />}
          onClick={addHighlightCard}
          variant="outlined"
          sx={{ borderColor: 'rgba(255,255,255,0.3)', color: 'rgba(255,255,255,0.9)' }}
        >
          Add Highlight Card
        </Button>
      </Grid>

      {/* ─────────────────────────────────────────────────────────────────────── */}
      {/* BOTTOM IMAGE CAROUSEL */}
      {/* ─────────────────────────────────────────────────────────────────────── */}
      <Grid item xs={12}>
        <Divider sx={{ my: 2, bgcolor: 'rgba(255,255,255,0.1)' }} />
        <Typography variant="h6" sx={{ mb: 1, color: 'rgba(255,255,255,0.9)' }}>
          Bottom Image Carousel
        </Typography>
        <Alert severity="info" sx={{ mb: 2, bgcolor: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.8)' }}>
          Recommend at least 7 unique images (different from top). Drag cards to reorder. Click a card to upload/replace.
        </Alert>
      </Grid>

      {bottomCarouselImages.map((url, idx) => {
        const isUploading = uploadingBottom === idx;
        const isDragging = dragCarousel === 'bottomCarouselImages' && draggedIndex === idx;
        const isDragOver = dragCarousel === 'bottomCarouselImages' && dragOverIndex === idx;
        const cardId = `bottom-img-card-${idx}`;
        
        return (
          <Grid item xs={12} sm={6} md={4} key={cardId}>
            <Box
              draggable={!isUploading && !!url}
              onDragStart={() => handleDragStart('bottomCarouselImages', idx)}
              onDragOver={(e) => handleDragOver(e, idx)}
              onDragLeave={handleDragLeave}
              onDragEnd={handleDragEnd}
              sx={{
                position: 'relative',
                bgcolor: 'rgba(255,255,255,0.03)',
                borderRadius: 2,
                border: isDragOver 
                  ? '2px dashed rgba(30, 215, 96, 0.8)' 
                  : '1px solid rgba(255,255,255,0.08)',
                overflow: 'hidden',
                opacity: isDragging ? 0.5 : 1,
                cursor: url ? 'grab' : 'pointer',
                transition: 'border 0.2s, opacity 0.2s',
                '&:hover': {
                  borderColor: 'rgba(255,255,255,0.2)',
                },
              }}
            >
              {/* Hidden file input for this card */}
              <input
                type="file"
                accept="image/png,image/jpeg,image/webp,image/gif"
                style={{ display: 'none' }}
                id={`bottom-file-input-${idx}`}
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleImageUpload('bottomCarouselImages', idx, file);
                  e.target.value = '';
                }}
              />
              
              {/* Clickable image area */}
              <Box
                component="label"
                htmlFor={`bottom-file-input-${idx}`}
                sx={{
                  display: 'block',
                  cursor: 'pointer',
                  width: '100%',
                  height: 120,
                }}
              >
                {url ? (
                  <Box
                    component="img"
                    src={url}
                    alt={`Bottom carousel ${idx + 1}`}
                    sx={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      display: 'block',
                      pointerEvents: 'none',
                    }}
                  />
                ) : (
                  <Box
                    sx={{
                      width: '100%',
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      bgcolor: 'rgba(255,255,255,0.02)',
                    }}
                  >
                    {isUploading ? (
                      <CircularProgress size={24} sx={{ color: 'rgba(255,255,255,0.5)' }} />
                    ) : (
                      <>
                        <CloudUploadIcon sx={{ color: 'rgba(255,255,255,0.3)', mb: 0.5 }} />
                        <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.3)' }}>
                          Click to upload
                        </Typography>
                      </>
                    )}
                  </Box>
                )}
              </Box>

              {/* Footer with label and delete */}
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  px: 1,
                  py: 0.5,
                  bgcolor: 'rgba(0,0,0,0.6)',
                }}
              >
                <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                  {idx + 1}
                </Typography>
                <IconButton
                  size="small"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    removeCarouselImage('bottomCarouselImages', idx);
                  }}
                  disabled={isUploading}
                  sx={{ color: 'rgba(255,255,255,0.5)', p: 0.5 }}
                >
                  <DeleteIcon sx={{ fontSize: 16 }} />
                </IconButton>
              </Box>
            </Box>
          </Grid>
        );
      })}

      <Grid item xs={12}>
        <Button
          startIcon={<AddIcon />}
          onClick={() => addEmptySlot('bottomCarouselImages')}
          variant="outlined"
          sx={{ borderColor: 'rgba(255,255,255,0.3)', color: 'rgba(255,255,255,0.9)' }}
        >
          Add Image Slot
        </Button>
      </Grid>

      {/* ─────────────────────────────────────────────────────────────────────── */}
      {/* MEASUREMENT SECTION HEADER */}
      {/* ─────────────────────────────────────────────────────────────────────── */}
      <Grid item xs={12}>
        <Divider sx={{ my: 2, bgcolor: 'rgba(255,255,255,0.1)' }} />
        <Typography variant="h6" sx={{ mb: 2, color: 'rgba(255,255,255,0.9)' }}>
          "How Do We Measure Impact?" Section
        </Typography>
      </Grid>

      <Grid item xs={12} md={6}>
        <CustomTextField
          label="Title (regular part)"
          value={impactSection.measureTitle || ''}
          onChange={(e) => onImpactSectionChange('measureTitle', e.target.value)}
          fullWidth
          placeholder="e.g., How do we"
        />
      </Grid>

      <Grid item xs={12} md={6}>
        <CustomTextField
          label="Title (highlighted part)"
          value={impactSection.measureTitleHighlight || ''}
          onChange={(e) => onImpactSectionChange('measureTitleHighlight', e.target.value)}
          fullWidth
          placeholder="e.g., measure impact"
        />
      </Grid>

      <Grid item xs={12}>
        <CustomTextField
          label="Subtitle"
          value={impactSection.measureSubtitle || ''}
          onChange={(e) => onImpactSectionChange('measureSubtitle', e.target.value)}
          fullWidth
          multiline
          rows={3}
          placeholder="We use Hello Insight, a nationally recognized evaluation tool..."
        />
      </Grid>

      <Grid item xs={12}>
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <Button
            size="small"
            variant="outlined"
            onClick={(e) => openColorPicker(e.currentTarget, 'measureTitleColor')}
            sx={{ borderColor: 'rgba(255,255,255,0.3)', color: 'rgba(255,255,255,0.9)' }}
          >
            <span style={{ display: 'inline-block', width: 16, height: 16, borderRadius: 3, background: impactSection.measureTitleColor || 'transparent', border: '1px solid rgba(255,255,255,0.2)' }} />
            &nbsp;Title color
          </Button>
          <Button
            size="small"
            variant="outlined"
            onClick={(e) => openColorPicker(e.currentTarget, 'measureTitleHighlightColor')}
            sx={{ borderColor: 'rgba(255,255,255,0.3)', color: 'rgba(255,255,255,0.9)' }}
          >
            <span style={{ display: 'inline-block', width: 16, height: 16, borderRadius: 3, background: impactSection.measureTitleHighlightColor || 'transparent', border: '1px solid rgba(255,255,255,0.2)' }} />
            &nbsp;Highlight color
          </Button>
          <Button
            size="small"
            variant="outlined"
            onClick={(e) => openColorPicker(e.currentTarget, 'measureSubtitleColor')}
            sx={{ borderColor: 'rgba(255,255,255,0.3)', color: 'rgba(255,255,255,0.9)' }}
          >
            <span style={{ display: 'inline-block', width: 16, height: 16, borderRadius: 3, background: impactSection.measureSubtitleColor || 'transparent', border: '1px solid rgba(255,255,255,0.2)' }} />
            &nbsp;Subtitle color
          </Button>
        </Box>
      </Grid>

      {/* ─────────────────────────────────────────────────────────────────────── */}
      {/* "OUR METHOD PROVIDES" CARD (LEFT COLUMN) */}
      {/* ─────────────────────────────────────────────────────────────────────── */}
      <Grid item xs={12}>
        <Divider sx={{ my: 2, bgcolor: 'rgba(255,255,255,0.1)' }} />
        <Typography variant="subtitle1" sx={{ mb: 2, color: 'rgba(255,255,255,0.8)' }}>
          "Our Method Provides" Card (Left Column)
        </Typography>
      </Grid>

      <Grid item xs={12} md={6}>
        <CustomTextField
          label="Card Title"
          value={impactSection.methodCardTitle || ''}
          onChange={(e) => onImpactSectionChange('methodCardTitle', e.target.value)}
          fullWidth
          placeholder="e.g., Our Method Provides"
        />
      </Grid>

      <Grid item xs={12} md={6}>
        <GradientEditor
          label="Title Underline Gradient"
          value={impactSection.methodCardAccentGradient || ''}
          onChange={(val) => onImpactSectionChange('methodCardAccentGradient', val)}
          onColorClick={(el, idx) => openGradientPicker(el, 'methodCardAccentGradient', idx)}
        />
      </Grid>

      <Grid item xs={12}>
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <Button
            size="small"
            variant="outlined"
            onClick={(e) => openColorPicker(e.currentTarget, 'methodCardTitleColor')}
            sx={{ borderColor: 'rgba(255,255,255,0.3)', color: 'rgba(255,255,255,0.9)' }}
          >
            <span style={{ display: 'inline-block', width: 16, height: 16, borderRadius: 3, background: impactSection.methodCardTitleColor || 'transparent', border: '1px solid rgba(255,255,255,0.2)' }} />
            &nbsp;Title color
          </Button>
          <Button
            size="small"
            variant="outlined"
            onClick={(e) => openColorPicker(e.currentTarget, 'methodCardBgColor')}
            sx={{ borderColor: 'rgba(255,255,255,0.3)', color: 'rgba(255,255,255,0.9)' }}
          >
            <span style={{ display: 'inline-block', width: 16, height: 16, borderRadius: 3, background: impactSection.methodCardBgColor || 'transparent', border: '1px solid rgba(255,255,255,0.2)' }} />
            &nbsp;Card bg
          </Button>
          <Button
            size="small"
            variant="outlined"
            onClick={(e) => openColorPicker(e.currentTarget, 'methodCardBorderColor')}
            sx={{ borderColor: 'rgba(255,255,255,0.3)', color: 'rgba(255,255,255,0.9)' }}
          >
            <span style={{ display: 'inline-block', width: 16, height: 16, borderRadius: 3, background: impactSection.methodCardBorderColor || 'transparent', border: '1px solid rgba(255,255,255,0.2)' }} />
            &nbsp;Card border
          </Button>
        </Box>
      </Grid>

      {/* Method Items */}
      <Grid item xs={12}>
        <Typography variant="subtitle2" sx={{ mb: 1, color: 'rgba(255,255,255,0.7)' }}>
          Method Items
        </Typography>
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mb: 2 }}>
          <Button
            size="small"
            variant="outlined"
            onClick={(e) => openColorPicker(e.currentTarget, 'methodItemBgColor')}
            sx={{ borderColor: 'rgba(255,255,255,0.3)', color: 'rgba(255,255,255,0.9)' }}
          >
            <span style={{ display: 'inline-block', width: 16, height: 16, borderRadius: 3, background: impactSection.methodItemBgColor || 'transparent', border: '1px solid rgba(255,255,255,0.2)' }} />
            &nbsp;Item bg
          </Button>
          <Button
            size="small"
            variant="outlined"
            onClick={(e) => openColorPicker(e.currentTarget, 'methodItemBorderColor')}
            sx={{ borderColor: 'rgba(255,255,255,0.3)', color: 'rgba(255,255,255,0.9)' }}
          >
            <span style={{ display: 'inline-block', width: 16, height: 16, borderRadius: 3, background: impactSection.methodItemBorderColor || 'transparent', border: '1px solid rgba(255,255,255,0.2)' }} />
            &nbsp;Item border
          </Button>
          <Button
            size="small"
            variant="outlined"
            onClick={(e) => openColorPicker(e.currentTarget, 'methodItemTitleColor')}
            sx={{ borderColor: 'rgba(255,255,255,0.3)', color: 'rgba(255,255,255,0.9)' }}
          >
            <span style={{ display: 'inline-block', width: 16, height: 16, borderRadius: 3, background: impactSection.methodItemTitleColor || 'transparent', border: '1px solid rgba(255,255,255,0.2)' }} />
            &nbsp;Item title
          </Button>
          <Button
            size="small"
            variant="outlined"
            onClick={(e) => openColorPicker(e.currentTarget, 'methodItemTextColor')}
            sx={{ borderColor: 'rgba(255,255,255,0.3)', color: 'rgba(255,255,255,0.9)' }}
          >
            <span style={{ display: 'inline-block', width: 16, height: 16, borderRadius: 3, background: impactSection.methodItemTextColor || 'transparent', border: '1px solid rgba(255,255,255,0.2)' }} />
            &nbsp;Item text
          </Button>
        </Box>
      </Grid>

      {methodItems.map((item, idx) => (
        <Grid item xs={12} key={item.id}>
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              gap: 2,
              p: 2,
              bgcolor: 'rgba(255,255,255,0.03)',
              borderRadius: 2,
              border: '1px solid rgba(255,255,255,0.08)',
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <IconSelector
                value={item.iconKey || ''}
                onChange={(val) => updateMethodItem(idx, 'iconKey', val)}
              />
              <CustomTextField
                label="Title"
                value={item.title}
                onChange={(e) => updateMethodItem(idx, 'title', e.target.value)}
                sx={{ flex: 1 }}
                placeholder="e.g., Trusting relationships with caring adults"
              />
              <IconButton
                onClick={() => removeMethodItem(idx)}
                sx={{ color: 'rgba(255,255,255,0.5)' }}
              >
                <DeleteIcon />
              </IconButton>
            </Box>
            <CustomTextField
              label="Description"
              value={item.text}
              onChange={(e) => updateMethodItem(idx, 'text', e.target.value)}
              fullWidth
              multiline
              rows={2}
              placeholder="Enter description..."
            />
          </Box>
        </Grid>
      ))}

      <Grid item xs={12}>
        <Button
          startIcon={<AddIcon />}
          onClick={addMethodItem}
          variant="outlined"
          sx={{ borderColor: 'rgba(255,255,255,0.3)', color: 'rgba(255,255,255,0.9)' }}
        >
          Add Method Item
        </Button>
      </Grid>

      {/* Method Card Footer */}
      <Grid item xs={12}>
        <CustomTextField
          label="Footer Text"
          value={impactSection.methodCardFooterText || ''}
          onChange={(e) => onImpactSectionChange('methodCardFooterText', e.target.value)}
          fullWidth
          multiline
          rows={2}
          placeholder="By investing in the mental health and creative capacities..."
        />
      </Grid>

      <Grid item xs={12}>
        <Button
          size="small"
          variant="outlined"
          onClick={(e) => openColorPicker(e.currentTarget, 'methodCardFooterTextColor')}
          sx={{ borderColor: 'rgba(255,255,255,0.3)', color: 'rgba(255,255,255,0.9)' }}
        >
          <span style={{ display: 'inline-block', width: 16, height: 16, borderRadius: 3, background: impactSection.methodCardFooterTextColor || 'transparent', border: '1px solid rgba(255,255,255,0.2)' }} />
          &nbsp;Footer text color
        </Button>
      </Grid>

      {/* ─────────────────────────────────────────────────────────────────────── */}
      {/* "MEASUREMENT & EVALUATION TOOLS" CARD (RIGHT COLUMN) */}
      {/* ─────────────────────────────────────────────────────────────────────── */}
      <Grid item xs={12}>
        <Divider sx={{ my: 2, bgcolor: 'rgba(255,255,255,0.1)' }} />
        <Typography variant="subtitle1" sx={{ mb: 2, color: 'rgba(255,255,255,0.8)' }}>
          "Measurement & Evaluation Tools" Card (Right Column)
        </Typography>
      </Grid>

      <Grid item xs={12} md={6}>
        <CustomTextField
          label="Card Title"
          value={impactSection.toolsCardTitle || ''}
          onChange={(e) => onImpactSectionChange('toolsCardTitle', e.target.value)}
          fullWidth
          placeholder="e.g., Measurement & Evaluation Tools"
        />
      </Grid>

      <Grid item xs={12} md={6}>
        <GradientEditor
          label="Tool Icon Background"
          value={impactSection.toolIconBgGradient || ''}
          onChange={(val) => onImpactSectionChange('toolIconBgGradient', val)}
          onColorClick={(el, idx) => openGradientPicker(el, 'toolIconBgGradient', idx)}
        />
      </Grid>

      <Grid item xs={12}>
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <Button
            size="small"
            variant="outlined"
            onClick={(e) => openColorPicker(e.currentTarget, 'toolsCardTitleColor')}
            sx={{ borderColor: 'rgba(255,255,255,0.3)', color: 'rgba(255,255,255,0.9)' }}
          >
            <span style={{ display: 'inline-block', width: 16, height: 16, borderRadius: 3, background: impactSection.toolsCardTitleColor || 'transparent', border: '1px solid rgba(255,255,255,0.2)' }} />
            &nbsp;Title color
          </Button>
          <Button
            size="small"
            variant="outlined"
            onClick={(e) => openColorPicker(e.currentTarget, 'toolsCardBgColor')}
            sx={{ borderColor: 'rgba(255,255,255,0.3)', color: 'rgba(255,255,255,0.9)' }}
          >
            <span style={{ display: 'inline-block', width: 16, height: 16, borderRadius: 3, background: impactSection.toolsCardBgColor || 'transparent', border: '1px solid rgba(255,255,255,0.2)' }} />
            &nbsp;Card bg
          </Button>
          <Button
            size="small"
            variant="outlined"
            onClick={(e) => openColorPicker(e.currentTarget, 'toolsCardBorderColor')}
            sx={{ borderColor: 'rgba(255,255,255,0.3)', color: 'rgba(255,255,255,0.9)' }}
          >
            <span style={{ display: 'inline-block', width: 16, height: 16, borderRadius: 3, background: impactSection.toolsCardBorderColor || 'transparent', border: '1px solid rgba(255,255,255,0.2)' }} />
            &nbsp;Card border
          </Button>
          <Button
            size="small"
            variant="outlined"
            onClick={(e) => openColorPicker(e.currentTarget, 'toolNameColor')}
            sx={{ borderColor: 'rgba(255,255,255,0.3)', color: 'rgba(255,255,255,0.9)' }}
          >
            <span style={{ display: 'inline-block', width: 16, height: 16, borderRadius: 3, background: impactSection.toolNameColor || 'transparent', border: '1px solid rgba(255,255,255,0.2)' }} />
            &nbsp;Tool name
          </Button>
          <Button
            size="small"
            variant="outlined"
            onClick={(e) => openColorPicker(e.currentTarget, 'toolDescriptionColor')}
            sx={{ borderColor: 'rgba(255,255,255,0.3)', color: 'rgba(255,255,255,0.9)' }}
          >
            <span style={{ display: 'inline-block', width: 16, height: 16, borderRadius: 3, background: impactSection.toolDescriptionColor || 'transparent', border: '1px solid rgba(255,255,255,0.2)' }} />
            &nbsp;Tool desc
          </Button>
        </Box>
      </Grid>

      {/* Tool Items */}
      <Grid item xs={12}>
        <Typography variant="subtitle2" sx={{ mb: 1, color: 'rgba(255,255,255,0.7)' }}>
          Evaluation Tools
        </Typography>
        <Alert severity="info" sx={{ mb: 2, bgcolor: 'rgba(33, 150, 243, 0.1)', color: 'rgba(255,255,255,0.8)' }}>
          Each tool uses a standard icon. Add tools with their title and description.
        </Alert>
      </Grid>

      {toolItems.map((item, idx) => (
        <Grid item xs={12} key={item.id}>
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              gap: 2,
              p: 2,
              bgcolor: 'rgba(255,255,255,0.03)',
              borderRadius: 2,
              border: '1px solid rgba(255,255,255,0.08)',
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <CustomTextField
                label="Tool Name"
                value={item.title}
                onChange={(e) => updateToolItem(idx, 'title', e.target.value)}
                sx={{ flex: 1 }}
                placeholder="e.g., Hello Insight SEL & PYD Evaluation Platform"
              />
              <IconButton
                onClick={() => removeToolItem(idx)}
                sx={{ color: 'rgba(255,255,255,0.5)' }}
              >
                <DeleteIcon />
              </IconButton>
            </Box>
            <CustomTextField
              label="Description"
              value={item.description}
              onChange={(e) => updateToolItem(idx, 'description', e.target.value)}
              fullWidth
              placeholder="e.g., Primary assessment tool for all students"
            />
          </Box>
        </Grid>
      ))}

      <Grid item xs={12}>
        <Button
          startIcon={<AddIcon />}
          onClick={addToolItem}
          variant="outlined"
          sx={{ borderColor: 'rgba(255,255,255,0.3)', color: 'rgba(255,255,255,0.9)' }}
        >
          Add Evaluation Tool
        </Button>
      </Grid>

      {/* Tools Card Footer */}
      <Grid item xs={12}>
        <CustomTextField
          label="Footer Text"
          value={impactSection.toolsFooterText || ''}
          onChange={(e) => onImpactSectionChange('toolsFooterText', e.target.value)}
          fullWidth
          multiline
          rows={2}
          placeholder="GOGO largely supports kids affected by systemic challenges..."
        />
      </Grid>

      <Grid item xs={12}>
        <Button
          size="small"
          variant="outlined"
          onClick={(e) => openColorPicker(e.currentTarget, 'toolsFooterTextColor')}
          sx={{ borderColor: 'rgba(255,255,255,0.3)', color: 'rgba(255,255,255,0.9)' }}
        >
          <span style={{ display: 'inline-block', width: 16, height: 16, borderRadius: 3, background: impactSection.toolsFooterTextColor || 'transparent', border: '1px solid rgba(255,255,255,0.2)' }} />
          &nbsp;Footer text color
        </Button>
      </Grid>
    </Grid>
  );
}

export default ImpactSectionTabEditor;


