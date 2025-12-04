import React, { useState, useRef } from 'react';
import {
  Grid,
  Box,
  Typography,
  Button,
  Divider,
  IconButton,
  FormControlLabel,
  Switch,
  CircularProgress,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import ColorPickerPopover from '../../components/ColorPickerPopover';
import { CustomTextField } from '../styles';
import { GradientEditor, parseGradientString, composeGradient } from './GradientEditor';
import { ImageCropper } from './ImageCropper';
import { ImpactLevelsContent, ImpactLevel } from '../../services/impact.api';
import { signUpload, uploadToSignedUrl } from '../../services/upload.api';
import { v4 as uuidv4 } from 'uuid';

export interface ImpactLevelsTabEditorProps {
  impactLevels: ImpactLevelsContent;
  defaultSwatch: string[] | null;
  onImpactLevelsChange: (field: keyof ImpactLevelsContent, value: any) => void;
}

type ColorPickerField =
  | 'sectionBgColor'
  | 'glowColor1'
  | 'glowColor2'
  | 'cardBgColor'
  | 'cardHoverBgColor'
  | 'amountColor'
  | 'descriptionColor'
  | 'header.subtitleColor'
  | 'cta.bgColor'
  | 'cta.textColor'
  | 'cta.hoverBgColor'
  | 'soundWave.color1'
  | 'soundWave.color2';

export function ImpactLevelsTabEditor({
  impactLevels,
  defaultSwatch,
  onImpactLevelsChange,
}: ImpactLevelsTabEditorProps) {
  const [colorPickerAnchor, setColorPickerAnchor] = useState<HTMLElement | null>(null);
  const [colorPickerField, setColorPickerField] = useState<ColorPickerField | null>(null);

  // Drag state for levels
  const [draggedLevelIndex, setDraggedLevelIndex] = useState<number | null>(null);
  const [dragOverLevelIndex, setDragOverLevelIndex] = useState<number | null>(null);

  // State for gradient color picker
  const [gradientPickerAnchor, setGradientPickerAnchor] = useState<HTMLElement | null>(null);
  const [gradientPickerKey, setGradientPickerKey] = useState<'sectionBgGradient' | 'header.titleGradient' | null>(null);
  const [gradientPickerColorIndex, setGradientPickerColorIndex] = useState<number>(0);
  const gradientPickerOpen = Boolean(gradientPickerAnchor);

  // Image upload state
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadingLevelId, setUploadingLevelId] = useState<string | null>(null);
  const [cropperOpen, setCropperOpen] = useState(false);
  const [cropperImageSrc, setCropperImageSrc] = useState('');
  const [cropperLevelId, setCropperLevelId] = useState<string | null>(null);

  // Get gradient value
  const getGradientValue = (key: 'sectionBgGradient' | 'header.titleGradient'): string => {
    if (key === 'sectionBgGradient') return impactLevels.sectionBgGradient || '';
    if (key === 'header.titleGradient') return impactLevels.header?.titleGradient || '';
    return '';
  };

  // Get current gradient color for the picker
  const getGradientPickerColor = (): string => {
    if (!gradientPickerKey) return '#000000';
    const gradient = getGradientValue(gradientPickerKey);
    if (!gradient) return '#000000';
    const parsed = parseGradientString(gradient);
    return parsed.colors[gradientPickerColorIndex] || '#000000';
  };

  const openGradientPicker = (el: HTMLElement, key: 'sectionBgGradient' | 'header.titleGradient', colorIndex: number) => {
    setGradientPickerKey(key);
    setGradientPickerColorIndex(colorIndex);
    setGradientPickerAnchor(el);
  };

  const handleGradientColorChange = (color: string) => {
    if (!gradientPickerKey) return;
    const currentGradient = getGradientValue(gradientPickerKey);
    if (!currentGradient) {
      const newGradient = `linear-gradient(135deg, ${color}, ${color})`;
      if (gradientPickerKey === 'sectionBgGradient') {
        onImpactLevelsChange('sectionBgGradient', newGradient);
      } else if (gradientPickerKey === 'header.titleGradient') {
        onImpactLevelsChange('header', { ...header, titleGradient: newGradient });
      }
      return;
    }
    const parsed = parseGradientString(currentGradient);
    const newColors = [...parsed.colors];
    newColors[gradientPickerColorIndex] = color;
    const newGradient = composeGradient(parsed.type, parsed.degree, newColors, parsed.opacity);
    if (gradientPickerKey === 'sectionBgGradient') {
      onImpactLevelsChange('sectionBgGradient', newGradient);
    } else if (gradientPickerKey === 'header.titleGradient') {
      onImpactLevelsChange('header', { ...header, titleGradient: newGradient });
    }
  };

  const closeGradientPicker = () => {
    setGradientPickerAnchor(null);
    setGradientPickerKey(null);
  };

  // Color picker helpers
  const openColorPicker = (el: HTMLElement, field: ColorPickerField) => {
    setColorPickerField(field);
    setColorPickerAnchor(el);
  };

  const handleColorChange = (color: string) => {
    if (!colorPickerField) return;

    if (colorPickerField.startsWith('header.')) {
      const subField = colorPickerField.replace('header.', '');
      onImpactLevelsChange('header', { ...header, [subField]: color });
    } else if (colorPickerField.startsWith('cta.')) {
      const subField = colorPickerField.replace('cta.', '');
      onImpactLevelsChange('cta', { ...cta, [subField]: color });
    } else if (colorPickerField.startsWith('soundWave.')) {
      const subField = colorPickerField.replace('soundWave.', '');
      onImpactLevelsChange('soundWave', { ...soundWave, [subField]: color });
    } else {
      onImpactLevelsChange(colorPickerField as keyof ImpactLevelsContent, color);
    }
  };

  const closeColorPicker = () => {
    setColorPickerAnchor(null);
    setColorPickerField(null);
  };

  const getColorValue = (field: ColorPickerField): string => {
    switch (field) {
      case 'sectionBgColor': return impactLevels.sectionBgColor || '';
      case 'glowColor1': return impactLevels.glowColor1 || '';
      case 'glowColor2': return impactLevels.glowColor2 || '';
      case 'cardBgColor': return impactLevels.cardBgColor || '';
      case 'cardHoverBgColor': return impactLevels.cardHoverBgColor || '';
      case 'amountColor': return impactLevels.amountColor || '';
      case 'descriptionColor': return impactLevels.descriptionColor || '';
      case 'header.subtitleColor': return impactLevels.header?.subtitleColor || '';
      case 'cta.bgColor': return impactLevels.cta?.bgColor || '';
      case 'cta.textColor': return impactLevels.cta?.textColor || '';
      case 'cta.hoverBgColor': return impactLevels.cta?.hoverBgColor || '';
      case 'soundWave.color1': return impactLevels.soundWave?.color1 || '';
      case 'soundWave.color2': return impactLevels.soundWave?.color2 || '';
      default: return '';
    }
  };

  // Header helpers
  const header = impactLevels.header ?? { title: '', titleGradient: '', subtitle: '', subtitleColor: '' };

  const updateHeader = (field: string, value: string) => {
    onImpactLevelsChange('header', { ...header, [field]: value });
  };

  // CTA helpers
  const cta = impactLevels.cta ?? { text: '', url: '', bgColor: '', textColor: '', hoverBgColor: '' };

  const updateCta = (field: string, value: string) => {
    onImpactLevelsChange('cta', { ...cta, [field]: value });
  };

  // Sound wave helpers
  const soundWave = impactLevels.soundWave ?? { enabled: true, color1: '', color2: '' };

  const updateSoundWave = (field: string, value: any) => {
    onImpactLevelsChange('soundWave', { ...soundWave, [field]: value });
  };

  // Levels helpers
  const levels: ImpactLevel[] = impactLevels.levels ?? [];

  const addLevel = () => {
    const newLevel: ImpactLevel = { id: uuidv4(), imageUrl: '', amount: '', description: '' };
    onImpactLevelsChange('levels', [...levels, newLevel]);
  };

  const updateLevel = (index: number, field: keyof ImpactLevel, value: string) => {
    const updated = [...levels];
    updated[index] = { ...updated[index], [field]: value };
    onImpactLevelsChange('levels', updated);
  };

  const updateLevelById = (levelId: string, field: keyof ImpactLevel, value: string) => {
    const updated = levels.map((level) =>
      level.id === levelId ? { ...level, [field]: value } : level
    );
    onImpactLevelsChange('levels', updated);
  };

  const removeLevel = (index: number) => {
    const updated = levels.filter((_, i) => i !== index);
    onImpactLevelsChange('levels', updated);
  };

  // Handle file selection for level image - opens cropper
  const handleLevelFileSelect = (e: React.ChangeEvent<HTMLInputElement>, levelId: string) => {
    if (!e.target.files || !e.target.files[0]) return;
    const file = e.target.files[0];

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      console.error('Invalid file type');
      return;
    }

    const objectUrl = URL.createObjectURL(file);
    setCropperImageSrc(objectUrl);
    setCropperLevelId(levelId);
    setCropperOpen(true);

    // Reset the input
    e.target.value = '';
  };

  // Handle cropped image upload for level
  const handleCroppedImageUpload = async (croppedBlob: Blob) => {
    if (!cropperLevelId) return;

    // Close cropper first
    setCropperOpen(false);
    const levelId = cropperLevelId;
    
    // Clean up object URL
    if (cropperImageSrc) {
      URL.revokeObjectURL(cropperImageSrc);
    }
    setCropperImageSrc('');
    setCropperLevelId(null);

    // Now upload
    setUploading(true);
    setUploadingLevelId(levelId);
    try {
      const signed = await signUpload({
        contentType: 'image/jpeg',
        extension: 'jpg',
        folder: 'impact-levels',
      });

      const putRes = await uploadToSignedUrl({
        uploadUrl: signed.uploadUrl,
        file: croppedBlob,
        contentType: 'image/jpeg',
      });

      if (!putRes.ok) {
        throw new Error('Failed to upload cropped image');
      }

      updateLevelById(levelId, 'imageUrl', signed.publicUrl);
    } catch (error) {
      console.error('Failed to upload image:', error);
    } finally {
      setUploading(false);
      setUploadingLevelId(null);
    }
  };

  // Handle closing the cropper
  const handleCropperClose = () => {
    setCropperOpen(false);
    if (cropperImageSrc) {
      URL.revokeObjectURL(cropperImageSrc);
    }
    setCropperImageSrc('');
    setCropperLevelId(null);
  };

  // Level drag handlers
  const handleLevelDragStart = (index: number) => {
    setDraggedLevelIndex(index);
  };

  const handleLevelDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedLevelIndex !== null && draggedLevelIndex !== index) {
      setDragOverLevelIndex(index);
    }
  };

  const handleLevelDragEnd = () => {
    if (
      draggedLevelIndex !== null &&
      dragOverLevelIndex !== null &&
      draggedLevelIndex !== dragOverLevelIndex
    ) {
      const items = [...levels];
      const [removed] = items.splice(draggedLevelIndex, 1);
      items.splice(dragOverLevelIndex, 0, removed);
      onImpactLevelsChange('levels', items);
    }
    setDraggedLevelIndex(null);
    setDragOverLevelIndex(null);
  };

  return (
    <Grid container spacing={3}>
      {/* Color Picker Popover */}
      <ColorPickerPopover
        open={Boolean(colorPickerAnchor) && Boolean(colorPickerField)}
        anchorEl={colorPickerAnchor}
        color={colorPickerField ? getColorValue(colorPickerField) : '#ffffff'}
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
          value={impactLevels.sectionBgGradient || ''}
          onChange={(gradient) => onImpactLevelsChange('sectionBgGradient', gradient)}
          onPickColor={(el, colorIndex) => openGradientPicker(el, 'sectionBgGradient', colorIndex)}
        />
      </Grid>

      <Grid item xs={12}>
        <Typography variant="subtitle2" sx={{ mb: 1, color: 'rgba(255,255,255,0.7)' }}>
          Ambient Glow Colors
        </Typography>
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          <Button
            size="small"
            variant="outlined"
            onClick={(e) => openColorPicker(e.currentTarget, 'glowColor1')}
            sx={{ borderColor: 'rgba(255,255,255,0.3)', color: 'rgba(255,255,255,0.9)' }}
          >
            <span style={{ display: 'inline-block', width: 16, height: 16, borderRadius: 3, background: impactLevels.glowColor1 || '#00A3FF', border: '1px solid rgba(255,255,255,0.2)' }} />
            &nbsp;Glow Color 1
          </Button>
          <Button
            size="small"
            variant="outlined"
            onClick={(e) => openColorPicker(e.currentTarget, 'glowColor2')}
            sx={{ borderColor: 'rgba(255,255,255,0.3)', color: 'rgba(255,255,255,0.9)' }}
          >
            <span style={{ display: 'inline-block', width: 16, height: 16, borderRadius: 3, background: impactLevels.glowColor2 || '#7C4DFF', border: '1px solid rgba(255,255,255,0.2)' }} />
            &nbsp;Glow Color 2
          </Button>
        </Box>
      </Grid>

      {/* ─────────────────────────────────────────────────────────────────────── */}
      {/* HEADER */}
      {/* ─────────────────────────────────────────────────────────────────────── */}
      <Grid item xs={12}>
        <Divider sx={{ my: 2, bgcolor: 'rgba(255,255,255,0.1)' }} />
        <Typography variant="h6" sx={{ mb: 2, color: 'rgba(255,255,255,0.9)' }}>
          Header
        </Typography>
      </Grid>

      <Grid item xs={12}>
        <CustomTextField
          label="Title"
          value={header.title || ''}
          onChange={(e) => updateHeader('title', e.target.value)}
          fullWidth
          placeholder="e.g. Impact Levels"
        />
      </Grid>

      <Grid item xs={12}>
        <GradientEditor
          label="Title Gradient"
          value={header.titleGradient || ''}
          onChange={(gradient) => updateHeader('titleGradient', gradient)}
          onPickColor={(el, colorIndex) => openGradientPicker(el, 'header.titleGradient', colorIndex)}
        />
      </Grid>

      <Grid item xs={12}>
        <CustomTextField
          label="Subtitle"
          value={header.subtitle || ''}
          onChange={(e) => updateHeader('subtitle', e.target.value)}
          fullWidth
          multiline
          rows={2}
          placeholder="e.g. Every dollar contributes to..."
        />
      </Grid>

      <Grid item xs={12}>
        <Button
          size="small"
          variant="outlined"
          onClick={(e) => openColorPicker(e.currentTarget, 'header.subtitleColor')}
          sx={{ borderColor: 'rgba(255,255,255,0.3)', color: 'rgba(255,255,255,0.9)' }}
        >
          <span style={{ display: 'inline-block', width: 16, height: 16, borderRadius: 3, background: header.subtitleColor || 'transparent', border: '1px solid rgba(255,255,255,0.2)' }} />
          &nbsp;Subtitle Color
        </Button>
      </Grid>

      {/* ─────────────────────────────────────────────────────────────────────── */}
      {/* CARD STYLING */}
      {/* ─────────────────────────────────────────────────────────────────────── */}
      <Grid item xs={12}>
        <Divider sx={{ my: 2, bgcolor: 'rgba(255,255,255,0.1)' }} />
        <Typography variant="h6" sx={{ mb: 2, color: 'rgba(255,255,255,0.9)' }}>
          Card Styling
        </Typography>
      </Grid>

      <Grid item xs={12}>
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          <Button
            size="small"
            variant="outlined"
            onClick={(e) => openColorPicker(e.currentTarget, 'cardBgColor')}
            sx={{ borderColor: 'rgba(255,255,255,0.3)', color: 'rgba(255,255,255,0.9)' }}
          >
            <span style={{ display: 'inline-block', width: 16, height: 16, borderRadius: 3, background: impactLevels.cardBgColor || 'transparent', border: '1px solid rgba(255,255,255,0.2)' }} />
            &nbsp;Card Background
          </Button>
          <Button
            size="small"
            variant="outlined"
            onClick={(e) => openColorPicker(e.currentTarget, 'cardHoverBgColor')}
            sx={{ borderColor: 'rgba(255,255,255,0.3)', color: 'rgba(255,255,255,0.9)' }}
          >
            <span style={{ display: 'inline-block', width: 16, height: 16, borderRadius: 3, background: impactLevels.cardHoverBgColor || 'transparent', border: '1px solid rgba(255,255,255,0.2)' }} />
            &nbsp;Card Hover
          </Button>
          <Button
            size="small"
            variant="outlined"
            onClick={(e) => openColorPicker(e.currentTarget, 'amountColor')}
            sx={{ borderColor: 'rgba(255,255,255,0.3)', color: 'rgba(255,255,255,0.9)' }}
          >
            <span style={{ display: 'inline-block', width: 16, height: 16, borderRadius: 3, background: impactLevels.amountColor || 'transparent', border: '1px solid rgba(255,255,255,0.2)' }} />
            &nbsp;Amount Color
          </Button>
          <Button
            size="small"
            variant="outlined"
            onClick={(e) => openColorPicker(e.currentTarget, 'descriptionColor')}
            sx={{ borderColor: 'rgba(255,255,255,0.3)', color: 'rgba(255,255,255,0.9)' }}
          >
            <span style={{ display: 'inline-block', width: 16, height: 16, borderRadius: 3, background: impactLevels.descriptionColor || 'transparent', border: '1px solid rgba(255,255,255,0.2)' }} />
            &nbsp;Description Color
          </Button>
        </Box>
      </Grid>

      {/* ─────────────────────────────────────────────────────────────────────── */}
      {/* IMPACT LEVELS */}
      {/* ─────────────────────────────────────────────────────────────────────── */}
      <Grid item xs={12}>
        <Divider sx={{ my: 2, bgcolor: 'rgba(255,255,255,0.1)' }} />
        <Typography variant="h6" sx={{ mb: 2, color: 'rgba(255,255,255,0.9)' }}>
          Impact Levels
        </Typography>
        <Typography variant="body2" sx={{ mb: 2, color: 'rgba(255,255,255,0.5)' }}>
          Drag to reorder. Each level needs an image, amount, and description.
        </Typography>
      </Grid>

      {/* Hidden file input for image uploads */}
      <input
        type="file"
        ref={fileInputRef}
        style={{ display: 'none' }}
        accept="image/jpeg,image/png,image/webp"
      />

      {/* Image Cropper Modal */}
      <ImageCropper
        open={cropperOpen}
        imageSrc={cropperImageSrc}
        onClose={handleCropperClose}
        onCropComplete={handleCroppedImageUpload}
        aspectRatio={1}
        freeformCrop={false}
      />

      {levels.map((level, idx) => {
        const isDragging = draggedLevelIndex === idx;
        const isDragOver = dragOverLevelIndex === idx;
        const isUploadingThis = uploading && uploadingLevelId === level.id;

        return (
          <Grid item xs={12} key={level.id}>
            <Box
              draggable
              onDragStart={() => handleLevelDragStart(idx)}
              onDragOver={(e) => handleLevelDragOver(e, idx)}
              onDragEnd={handleLevelDragEnd}
              sx={{
                display: 'flex',
                alignItems: 'stretch',
                gap: 2,
                p: 2,
                bgcolor: 'rgba(255,255,255,0.03)',
                borderRadius: 2,
                border: isDragOver
                  ? '2px dashed rgba(0, 163, 255, 0.8)'
                  : '1px solid rgba(255,255,255,0.08)',
                opacity: isDragging ? 0.5 : 1,
                cursor: 'grab',
                transition: 'border 0.15s ease',
              }}
            >
              <DragIndicatorIcon sx={{ color: 'rgba(255,255,255,0.3)', flexShrink: 0, mt: 1 }} />
              
              {/* Image upload section */}
              <Box sx={{ flexShrink: 0 }}>
                <input
                  type="file"
                  id={`level-image-${level.id}`}
                  onChange={(e) => handleLevelFileSelect(e, level.id)}
                  accept="image/jpeg,image/png,image/webp"
                  style={{ display: 'none' }}
                />
                {level.imageUrl ? (
                  <Box
                    sx={{
                      position: 'relative',
                      width: 80,
                      height: 80,
                      borderRadius: 1,
                      overflow: 'hidden',
                      border: '1px solid rgba(255,255,255,0.1)',
                    }}
                  >
                    <img
                      src={level.imageUrl}
                      alt={level.amount}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                    {isUploadingThis && (
                      <Box
                        sx={{
                          position: 'absolute',
                          inset: 0,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          bgcolor: 'rgba(0,0,0,0.7)',
                        }}
                      >
                        <CircularProgress size={24} sx={{ color: '#00A3FF' }} />
                      </Box>
                    )}
                    <Box
                      sx={{
                        position: 'absolute',
                        inset: 0,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        bgcolor: 'rgba(0,0,0,0)',
                        transition: 'background 0.2s ease',
                        cursor: 'pointer',
                        '&:hover': {
                          bgcolor: 'rgba(0,0,0,0.6)',
                        },
                        '&:hover .replace-text': {
                          opacity: 1,
                        },
                      }}
                      onClick={() => document.getElementById(`level-image-${level.id}`)?.click()}
                    >
                      <Typography
                        className="replace-text"
                        sx={{
                          color: 'white',
                          fontSize: '0.7rem',
                          opacity: 0,
                          transition: 'opacity 0.2s ease',
                        }}
                      >
                        Replace
                      </Typography>
                    </Box>
                  </Box>
                ) : (
                  <Box
                    onClick={() => !isUploadingThis && document.getElementById(`level-image-${level.id}`)?.click()}
                    sx={{
                      width: 80,
                      height: 80,
                      border: '2px dashed rgba(255,255,255,0.2)',
                      borderRadius: 1,
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: isUploadingThis ? 'default' : 'pointer',
                      transition: 'all 0.2s ease',
                      '&:hover': !isUploadingThis ? {
                        borderColor: 'rgba(255,255,255,0.4)',
                        bgcolor: 'rgba(255,255,255,0.02)',
                      } : {},
                    }}
                  >
                    {isUploadingThis ? (
                      <CircularProgress size={24} sx={{ color: '#00A3FF' }} />
                    ) : (
                      <CloudUploadIcon sx={{ fontSize: 24, color: 'rgba(255,255,255,0.3)' }} />
                    )}
                  </Box>
                )}
              </Box>

              {/* Text fields */}
              <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 1 }}>
                <CustomTextField
                  label="Amount"
                  value={level.amount}
                  onChange={(e) => updateLevel(idx, 'amount', e.target.value)}
                  size="small"
                  fullWidth
                  placeholder="$75"
                />
                <CustomTextField
                  label="Description"
                  value={level.description}
                  onChange={(e) => updateLevel(idx, 'description', e.target.value)}
                  size="small"
                  fullWidth
                  placeholder="Provides one mentoring session"
                />
              </Box>

              <IconButton
                onClick={() => removeLevel(idx)}
                sx={{ color: 'rgba(255,255,255,0.5)', alignSelf: 'flex-start' }}
              >
                <DeleteIcon />
              </IconButton>
            </Box>
          </Grid>
        );
      })}

      <Grid item xs={12}>
        <Button
          startIcon={<AddIcon />}
          onClick={addLevel}
          variant="outlined"
          size="small"
          sx={{ borderColor: 'rgba(255,255,255,0.3)', color: 'rgba(255,255,255,0.9)' }}
        >
          Add Impact Level
        </Button>
      </Grid>

      {/* ─────────────────────────────────────────────────────────────────────── */}
      {/* CTA BUTTON */}
      {/* ─────────────────────────────────────────────────────────────────────── */}
      <Grid item xs={12}>
        <Divider sx={{ my: 2, bgcolor: 'rgba(255,255,255,0.1)' }} />
        <Typography variant="h6" sx={{ mb: 2, color: 'rgba(255,255,255,0.9)' }}>
          Call to Action Button
        </Typography>
      </Grid>

      <Grid item xs={12} md={6}>
        <CustomTextField
          label="Button Text"
          value={cta.text || ''}
          onChange={(e) => updateCta('text', e.target.value)}
          fullWidth
          placeholder="e.g. Make an Impact Today"
        />
      </Grid>

      <Grid item xs={12} md={6}>
        <CustomTextField
          label="Button URL"
          value={cta.url || ''}
          onChange={(e) => updateCta('url', e.target.value)}
          fullWidth
          placeholder="https://..."
        />
      </Grid>

      <Grid item xs={12}>
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          <Button
            size="small"
            variant="outlined"
            onClick={(e) => openColorPicker(e.currentTarget, 'cta.bgColor')}
            sx={{ borderColor: 'rgba(255,255,255,0.3)', color: 'rgba(255,255,255,0.9)' }}
          >
            <span style={{ display: 'inline-block', width: 16, height: 16, borderRadius: 3, background: cta.bgColor || 'transparent', border: '1px solid rgba(255,255,255,0.2)' }} />
            &nbsp;Button Background
          </Button>
          <Button
            size="small"
            variant="outlined"
            onClick={(e) => openColorPicker(e.currentTarget, 'cta.textColor')}
            sx={{ borderColor: 'rgba(255,255,255,0.3)', color: 'rgba(255,255,255,0.9)' }}
          >
            <span style={{ display: 'inline-block', width: 16, height: 16, borderRadius: 3, background: cta.textColor || 'transparent', border: '1px solid rgba(255,255,255,0.2)' }} />
            &nbsp;Button Text
          </Button>
          <Button
            size="small"
            variant="outlined"
            onClick={(e) => openColorPicker(e.currentTarget, 'cta.hoverBgColor')}
            sx={{ borderColor: 'rgba(255,255,255,0.3)', color: 'rgba(255,255,255,0.9)' }}
          >
            <span style={{ display: 'inline-block', width: 16, height: 16, borderRadius: 3, background: cta.hoverBgColor || 'transparent', border: '1px solid rgba(255,255,255,0.2)' }} />
            &nbsp;Button Hover
          </Button>
        </Box>
      </Grid>

      {/* ─────────────────────────────────────────────────────────────────────── */}
      {/* SOUND WAVE */}
      {/* ─────────────────────────────────────────────────────────────────────── */}
      <Grid item xs={12}>
        <Divider sx={{ my: 2, bgcolor: 'rgba(255,255,255,0.1)' }} />
        <Typography variant="h6" sx={{ mb: 2, color: 'rgba(255,255,255,0.9)' }}>
          Sound Wave Animation
        </Typography>
      </Grid>

      <Grid item xs={12}>
        <FormControlLabel
          control={
            <Switch
              checked={soundWave.enabled ?? true}
              onChange={(e) => updateSoundWave('enabled', e.target.checked)}
              sx={{
                '& .MuiSwitch-switchBase.Mui-checked': { color: '#00A3FF' },
                '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { backgroundColor: '#00A3FF' },
              }}
            />
          }
          label="Show Sound Wave"
          sx={{ color: 'white', mb: 1 }}
        />
      </Grid>

      <Grid item xs={12}>
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          <Button
            size="small"
            variant="outlined"
            onClick={(e) => openColorPicker(e.currentTarget, 'soundWave.color1')}
            sx={{ borderColor: 'rgba(255,255,255,0.3)', color: 'rgba(255,255,255,0.9)' }}
          >
            <span style={{ display: 'inline-block', width: 16, height: 16, borderRadius: 3, background: soundWave.color1 || 'transparent', border: '1px solid rgba(255,255,255,0.2)' }} />
            &nbsp;Wave Color 1
          </Button>
          <Button
            size="small"
            variant="outlined"
            onClick={(e) => openColorPicker(e.currentTarget, 'soundWave.color2')}
            sx={{ borderColor: 'rgba(255,255,255,0.3)', color: 'rgba(255,255,255,0.9)' }}
          >
            <span style={{ display: 'inline-block', width: 16, height: 16, borderRadius: 3, background: soundWave.color2 || 'transparent', border: '1px solid rgba(255,255,255,0.2)' }} />
            &nbsp;Wave Color 2
          </Button>
        </Box>
      </Grid>

      {/* ─────────────────────────────────────────────────────────────────────── */}
      {/* ACCESSIBILITY */}
      {/* ─────────────────────────────────────────────────────────────────────── */}
      <Grid item xs={12}>
        <Divider sx={{ my: 2, bgcolor: 'rgba(255,255,255,0.1)' }} />
        <Typography variant="h6" sx={{ mb: 2, color: 'rgba(255,255,255,0.9)' }}>
          Accessibility
        </Typography>
      </Grid>

      <Grid item xs={12}>
        <CustomTextField
          label="ARIA Label"
          value={impactLevels.ariaLabel || ''}
          onChange={(e) => onImpactLevelsChange('ariaLabel', e.target.value)}
          fullWidth
          placeholder="e.g. Impact levels section"
        />
      </Grid>
    </Grid>
  );
}

export default ImpactLevelsTabEditor;

