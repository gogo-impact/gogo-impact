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
import { FlexCContent, FlexCCredit } from '../../services/impact.api';
import { signUpload, uploadToSignedUrl } from '../../services/upload.api';
import { v4 as uuidv4 } from 'uuid';

export interface FlexCTabEditorProps {
  flexC: FlexCContent;
  defaultSwatch: string[] | null;
  onFlexCChange: (field: keyof FlexCContent, value: any) => void;
}

type FlexCColorPickerField =
  | 'primaryColor'
  | 'titleColor'
  | 'subtitleColor'
  | 'notesTextColor'
  | 'creditRoleColor'
  | 'creditValueColor'
  | 'borderColor';

export function FlexCTabEditor({
  flexC,
  defaultSwatch,
  onFlexCChange,
}: FlexCTabEditorProps) {
  const [colorPickerAnchor, setColorPickerAnchor] = useState<HTMLElement | null>(null);
  const [colorPickerField, setColorPickerField] = useState<FlexCColorPickerField | null>(null);

  // Drag state for paragraphs
  const [draggedParagraphIndex, setDraggedParagraphIndex] = useState<number | null>(null);
  const [dragOverParagraphIndex, setDragOverParagraphIndex] = useState<number | null>(null);

  // Drag state for credits
  const [draggedCreditIndex, setDraggedCreditIndex] = useState<number | null>(null);
  const [dragOverCreditIndex, setDragOverCreditIndex] = useState<number | null>(null);

  // State for gradient color picker
  const [gradientPickerAnchor, setGradientPickerAnchor] = useState<HTMLElement | null>(null);
  const [gradientPickerKey, setGradientPickerKey] = useState<'sectionBgGradient' | null>(null);
  const [gradientPickerColorIndex, setGradientPickerColorIndex] = useState<number>(0);
  const gradientPickerOpen = Boolean(gradientPickerAnchor);

  // Image upload state
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [uploading, setUploading] = useState(false);
  const [cropperOpen, setCropperOpen] = useState(false);
  const [cropperImageSrc, setCropperImageSrc] = useState('');

  // Get gradient value
  const getGradientValue = (key: 'sectionBgGradient'): string => {
    return flexC.sectionBgGradient || '';
  };

  // Get current gradient color for the picker
  const getGradientPickerColor = (): string => {
    if (!gradientPickerKey) return '#000000';
    const gradient = getGradientValue(gradientPickerKey);
    if (!gradient) return '#000000';
    const parsed = parseGradientString(gradient);
    return parsed.colors[gradientPickerColorIndex] || '#000000';
  };

  const openGradientPicker = (el: HTMLElement, key: 'sectionBgGradient', colorIndex: number) => {
    setGradientPickerKey(key);
    setGradientPickerColorIndex(colorIndex);
    setGradientPickerAnchor(el);
  };

  const handleGradientColorChange = (color: string) => {
    if (!gradientPickerKey) return;
    const currentGradient = getGradientValue(gradientPickerKey);
    if (!currentGradient) {
      const newGradient = `linear-gradient(180deg, ${color}, ${color})`;
      onFlexCChange(gradientPickerKey, newGradient);
      return;
    }
    const parsed = parseGradientString(currentGradient);
    const newColors = [...parsed.colors];
    newColors[gradientPickerColorIndex] = color;
    const newGradient = composeGradient(parsed.type, parsed.degree, newColors, parsed.opacity);
    onFlexCChange(gradientPickerKey, newGradient);
  };

  const closeGradientPicker = () => {
    setGradientPickerAnchor(null);
    setGradientPickerKey(null);
  };

  // Color picker helpers
  const openColorPicker = (el: HTMLElement, field: FlexCColorPickerField) => {
    setColorPickerField(field);
    setColorPickerAnchor(el);
  };

  const handleColorChange = (color: string) => {
    if (colorPickerField) {
      onFlexCChange(colorPickerField, color);
    }
  };

  const closeColorPicker = () => {
    setColorPickerAnchor(null);
    setColorPickerField(null);
  };

  const getColorValue = (field: FlexCColorPickerField): string => {
    switch (field) {
      case 'primaryColor':
        return flexC.primaryColor || '';
      case 'titleColor':
        return flexC.titleColor || '';
      case 'subtitleColor':
        return flexC.subtitleColor || '';
      case 'notesTextColor':
        return flexC.notesTextColor || '';
      case 'creditRoleColor':
        return flexC.creditRoleColor || '';
      case 'creditValueColor':
        return flexC.creditValueColor || '';
      case 'borderColor':
        return flexC.borderColor || '';
      default:
        return '';
    }
  };

  // Header helpers
  const header = flexC.header ?? { label: '', title: '', subtitle: '' };

  const updateHeader = (field: string, value: string) => {
    onFlexCChange('header', {
      ...header,
      [field]: value,
    });
  };

  // Poster helpers
  const poster = flexC.poster ?? { imageUrl: '', imageAlt: '', videoUrl: null, showPlayButton: true };

  const updatePoster = (field: string, value: any) => {
    onFlexCChange('poster', {
      ...poster,
      [field]: value,
    });
  };

  // Handle file selection - opens cropper
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
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
    setCropperOpen(true);

    // Reset the input
    e.target.value = '';
  };

  // Handle cropped image upload
  const handleCroppedImageUpload = async (croppedBlob: Blob) => {
    // Close cropper first
    setCropperOpen(false);
    // Clean up object URL
    if (cropperImageSrc) {
      URL.revokeObjectURL(cropperImageSrc);
    }
    setCropperImageSrc('');

    // Now upload
    setUploading(true);
    try {
      const signed = await signUpload({
        contentType: 'image/jpeg',
        extension: 'jpg',
        folder: 'flex-c',
      });

      const putRes = await uploadToSignedUrl({
        uploadUrl: signed.uploadUrl,
        file: croppedBlob,
        contentType: 'image/jpeg',
      });

      if (!putRes.ok) {
        throw new Error('Failed to upload cropped image');
      }

      updatePoster('imageUrl', signed.publicUrl);
    } catch (error) {
      console.error('Failed to upload image:', error);
    } finally {
      setUploading(false);
    }
  };

  // Handle closing the cropper
  const handleCropperClose = () => {
    setCropperOpen(false);
    if (cropperImageSrc) {
      URL.revokeObjectURL(cropperImageSrc);
    }
    setCropperImageSrc('');
  };

  // Handle removing the image
  const handleRemoveImage = () => {
    updatePoster('imageUrl', '');
  };

  // Director's notes helpers
  const directorsNotes = flexC.directorsNotes ?? { label: '', paragraphs: [] };
  const notesParagraphs: string[] = directorsNotes.paragraphs ?? [];

  const updateDirectorsNotesLabel = (value: string) => {
    onFlexCChange('directorsNotes', {
      ...directorsNotes,
      label: value,
    });
  };

  const addNotesParagraph = () => {
    onFlexCChange('directorsNotes', {
      ...directorsNotes,
      paragraphs: [...notesParagraphs, ''],
    });
  };

  const updateNotesParagraph = (index: number, value: string) => {
    const updated = [...notesParagraphs];
    updated[index] = value;
    onFlexCChange('directorsNotes', {
      ...directorsNotes,
      paragraphs: updated,
    });
  };

  const removeNotesParagraph = (index: number) => {
    const updated = notesParagraphs.filter((_, i) => i !== index);
    onFlexCChange('directorsNotes', {
      ...directorsNotes,
      paragraphs: updated,
    });
  };

  // Paragraph drag handlers
  const handleParagraphDragStart = (index: number) => {
    setDraggedParagraphIndex(index);
  };

  const handleParagraphDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedParagraphIndex !== null && draggedParagraphIndex !== index) {
      setDragOverParagraphIndex(index);
    }
  };

  const handleParagraphDragEnd = () => {
    if (
      draggedParagraphIndex !== null &&
      dragOverParagraphIndex !== null &&
      draggedParagraphIndex !== dragOverParagraphIndex
    ) {
      const items = [...notesParagraphs];
      const [removed] = items.splice(draggedParagraphIndex, 1);
      items.splice(dragOverParagraphIndex, 0, removed);
      onFlexCChange('directorsNotes', {
        ...directorsNotes,
        paragraphs: items,
      });
    }
    setDraggedParagraphIndex(null);
    setDragOverParagraphIndex(null);
  };

  // Credits helpers
  const credits: FlexCCredit[] = flexC.credits ?? [];

  const addCredit = () => {
    const newCredit: FlexCCredit = { id: uuidv4(), role: '', value: '' };
    onFlexCChange('credits', [...credits, newCredit]);
  };

  const updateCredit = (index: number, field: keyof FlexCCredit, value: string) => {
    const updated = [...credits];
    updated[index] = { ...updated[index], [field]: value };
    onFlexCChange('credits', updated);
  };

  const removeCredit = (index: number) => {
    const updated = credits.filter((_, i) => i !== index);
    onFlexCChange('credits', updated);
  };

  // Credit drag handlers
  const handleCreditDragStart = (index: number) => {
    setDraggedCreditIndex(index);
  };

  const handleCreditDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedCreditIndex !== null && draggedCreditIndex !== index) {
      setDragOverCreditIndex(index);
    }
  };

  const handleCreditDragEnd = () => {
    if (
      draggedCreditIndex !== null &&
      dragOverCreditIndex !== null &&
      draggedCreditIndex !== dragOverCreditIndex
    ) {
      const items = [...credits];
      const [removed] = items.splice(draggedCreditIndex, 1);
      items.splice(dragOverCreditIndex, 0, removed);
      onFlexCChange('credits', items);
    }
    setDraggedCreditIndex(null);
    setDragOverCreditIndex(null);
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
          value={getGradientValue('sectionBgGradient')}
          onChange={(gradient) => onFlexCChange('sectionBgGradient', gradient)}
          onPickColor={(el, colorIndex) => openGradientPicker(el, 'sectionBgGradient', colorIndex)}
        />
      </Grid>

      {/* ─────────────────────────────────────────────────────────────────────── */}
      {/* COLORS */}
      {/* ─────────────────────────────────────────────────────────────────────── */}
      <Grid item xs={12}>
        <Divider sx={{ my: 2, bgcolor: 'rgba(255,255,255,0.1)' }} />
        <Typography variant="h6" sx={{ mb: 2, color: 'rgba(255,255,255,0.9)' }}>
          Colors
        </Typography>
      </Grid>

      <Grid item xs={12}>
        <Typography variant="subtitle2" sx={{ mb: 1, color: 'rgba(255,255,255,0.7)' }}>
          Primary Color
        </Typography>
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mb: 2 }}>
          <Button
            size="small"
            variant="outlined"
            onClick={(e) => openColorPicker(e.currentTarget, 'primaryColor')}
            sx={{ borderColor: 'rgba(255,255,255,0.3)', color: 'rgba(255,255,255,0.9)' }}
          >
            <span style={{ display: 'inline-block', width: 16, height: 16, borderRadius: 3, background: flexC.primaryColor || '#14B8A6', border: '1px solid rgba(255,255,255,0.2)' }} />
            &nbsp;Primary accent
          </Button>
        </Box>

        <Typography variant="subtitle2" sx={{ mb: 1, color: 'rgba(255,255,255,0.7)' }}>
          Title Colors
        </Typography>
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mb: 2 }}>
          <Button
            size="small"
            variant="outlined"
            onClick={(e) => openColorPicker(e.currentTarget, 'titleColor')}
            sx={{ borderColor: 'rgba(255,255,255,0.3)', color: 'rgba(255,255,255,0.9)' }}
          >
            <span style={{ display: 'inline-block', width: 16, height: 16, borderRadius: 3, background: flexC.titleColor || '#fff', border: '1px solid rgba(255,255,255,0.2)' }} />
            &nbsp;Title
          </Button>
          <Button
            size="small"
            variant="outlined"
            onClick={(e) => openColorPicker(e.currentTarget, 'subtitleColor')}
            sx={{ borderColor: 'rgba(255,255,255,0.3)', color: 'rgba(255,255,255,0.9)' }}
          >
            <span style={{ display: 'inline-block', width: 16, height: 16, borderRadius: 3, background: flexC.subtitleColor || 'rgba(255,255,255,0.6)', border: '1px solid rgba(255,255,255,0.2)' }} />
            &nbsp;Subtitle
          </Button>
        </Box>

        <Typography variant="subtitle2" sx={{ mb: 1, color: 'rgba(255,255,255,0.7)' }}>
          Notes Text
        </Typography>
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mb: 2 }}>
          <Button
            size="small"
            variant="outlined"
            onClick={(e) => openColorPicker(e.currentTarget, 'notesTextColor')}
            sx={{ borderColor: 'rgba(255,255,255,0.3)', color: 'rgba(255,255,255,0.9)' }}
          >
            <span style={{ display: 'inline-block', width: 16, height: 16, borderRadius: 3, background: flexC.notesTextColor || 'rgba(255,255,255,0.8)', border: '1px solid rgba(255,255,255,0.2)' }} />
            &nbsp;Director's notes text
          </Button>
        </Box>

        <Typography variant="subtitle2" sx={{ mb: 1, color: 'rgba(255,255,255,0.7)' }}>
          Credits Colors
        </Typography>
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mb: 2 }}>
          <Button
            size="small"
            variant="outlined"
            onClick={(e) => openColorPicker(e.currentTarget, 'creditRoleColor')}
            sx={{ borderColor: 'rgba(255,255,255,0.3)', color: 'rgba(255,255,255,0.9)' }}
          >
            <span style={{ display: 'inline-block', width: 16, height: 16, borderRadius: 3, background: flexC.creditRoleColor || 'rgba(255,255,255,0.4)', border: '1px solid rgba(255,255,255,0.2)' }} />
            &nbsp;Credit role
          </Button>
          <Button
            size="small"
            variant="outlined"
            onClick={(e) => openColorPicker(e.currentTarget, 'creditValueColor')}
            sx={{ borderColor: 'rgba(255,255,255,0.3)', color: 'rgba(255,255,255,0.9)' }}
          >
            <span style={{ display: 'inline-block', width: 16, height: 16, borderRadius: 3, background: flexC.creditValueColor || '#fff', border: '1px solid rgba(255,255,255,0.2)' }} />
            &nbsp;Credit value
          </Button>
        </Box>

        <Typography variant="subtitle2" sx={{ mb: 1, color: 'rgba(255,255,255,0.7)' }}>
          Border / Bar Color
        </Typography>
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <Button
            size="small"
            variant="outlined"
            onClick={(e) => openColorPicker(e.currentTarget, 'borderColor')}
            sx={{ borderColor: 'rgba(255,255,255,0.3)', color: 'rgba(255,255,255,0.9)' }}
          >
            <span style={{ display: 'inline-block', width: 16, height: 16, borderRadius: 3, background: flexC.borderColor || 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)' }} />
            &nbsp;Border / divider lines
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
          label="Label (Monospace)"
          value={header.label || ''}
          onChange={(e) => updateHeader('label', e.target.value)}
          fullWidth
          placeholder="e.g. New York City Launch"
        />
      </Grid>

      <Grid item xs={12}>
        <CustomTextField
          label="Title"
          value={header.title || ''}
          onChange={(e) => updateHeader('title', e.target.value)}
          fullWidth
          placeholder="e.g. Concrete Symphony"
        />
      </Grid>

      <Grid item xs={12}>
        <CustomTextField
          label="Subtitle"
          value={header.subtitle || ''}
          onChange={(e) => updateHeader('subtitle', e.target.value)}
          fullWidth
          placeholder="e.g. A Mini-Documentary"
        />
      </Grid>

      {/* ─────────────────────────────────────────────────────────────────────── */}
      {/* POSTER */}
      {/* ─────────────────────────────────────────────────────────────────────── */}
      <Grid item xs={12}>
        <Divider sx={{ my: 2, bgcolor: 'rgba(255,255,255,0.1)' }} />
        <Typography variant="h6" sx={{ mb: 2, color: 'rgba(255,255,255,0.9)' }}>
          Poster / Video
        </Typography>
      </Grid>

      <Grid item xs={12}>
        <CustomTextField
          label="YouTube Video URL"
          value={poster.videoUrl || ''}
          onChange={(e) => updatePoster('videoUrl', e.target.value || null)}
          fullWidth
          placeholder="https://www.youtube.com/watch?v=XXXXXXXXX"
          helperText="Enter a YouTube link (e.g. https://www.youtube.com/watch?v=dQw4w9WgXcQ or https://youtu.be/dQw4w9WgXcQ). The video will be embedded and play when clicked."
        />
      </Grid>

      <Grid item xs={12}>
        <Typography variant="subtitle2" sx={{ mb: 1, color: 'rgba(255,255,255,0.7)' }}>
          Video Thumbnail
        </Typography>
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileSelect}
          accept="image/jpeg,image/png,image/webp"
          style={{ display: 'none' }}
        />
        
        {poster.imageUrl ? (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Box
              sx={{
                position: 'relative',
                width: '100%',
                maxWidth: 400,
                aspectRatio: '16/9',
                borderRadius: 2,
                overflow: 'hidden',
                border: '1px solid rgba(255,255,255,0.1)',
              }}
            >
              <img
                src={poster.imageUrl}
                alt={poster.imageAlt || 'Video thumbnail preview'}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
              {uploading && (
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
                  <CircularProgress size={32} sx={{ color: '#14B8A6' }} />
                </Box>
              )}
            </Box>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button
                variant="outlined"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                startIcon={<CloudUploadIcon />}
                sx={{ borderColor: 'rgba(255,255,255,0.3)', color: 'rgba(255,255,255,0.9)' }}
              >
                Replace Thumbnail
              </Button>
              <Button
                variant="outlined"
                onClick={handleRemoveImage}
                disabled={uploading}
                startIcon={<DeleteIcon />}
                sx={{ borderColor: 'rgba(255,255,255,0.3)', color: 'rgba(255,255,255,0.9)' }}
              >
                Remove
              </Button>
            </Box>
          </Box>
        ) : (
          <Box
            onClick={() => !uploading && fileInputRef.current?.click()}
            sx={{
              border: '2px dashed rgba(255,255,255,0.2)',
              borderRadius: 2,
              p: 4,
              textAlign: 'center',
              cursor: uploading ? 'default' : 'pointer',
              transition: 'all 0.2s ease',
              '&:hover': !uploading ? {
                borderColor: 'rgba(255,255,255,0.4)',
                bgcolor: 'rgba(255,255,255,0.02)',
              } : {},
            }}
          >
            {uploading ? (
              <CircularProgress size={32} sx={{ color: '#14B8A6' }} />
            ) : (
              <>
                <CloudUploadIcon sx={{ fontSize: 48, color: 'rgba(255,255,255,0.4)', mb: 1 }} />
                <Typography sx={{ color: 'rgba(255,255,255,0.6)' }}>
                  Click to upload video thumbnail
                </Typography>
                <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.4)' }}>
                  JPG, PNG, or WebP (16:9 recommended)
                </Typography>
              </>
            )}
          </Box>
        )}
      </Grid>

      {/* Image Cropper Modal */}
      <ImageCropper
        open={cropperOpen}
        imageSrc={cropperImageSrc}
        onClose={handleCropperClose}
        onCropComplete={handleCroppedImageUpload}
        aspectRatio={16 / 9}
        freeformCrop={false}
      />

      <Grid item xs={12}>
        <CustomTextField
          label="Thumbnail Alt Text"
          value={poster.imageAlt || ''}
          onChange={(e) => updatePoster('imageAlt', e.target.value)}
          fullWidth
          placeholder="Describe the image for accessibility"
        />
      </Grid>

      <Grid item xs={12}>
        <FormControlLabel
          control={
            <Switch
              checked={poster.showPlayButton ?? true}
              onChange={(e) => updatePoster('showPlayButton', e.target.checked)}
              sx={{
                '& .MuiSwitch-switchBase.Mui-checked': { color: '#14B8A6' },
                '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { backgroundColor: '#14B8A6' },
              }}
            />
          }
          label="Show Play Button Overlay"
          sx={{ color: 'white' }}
        />
      </Grid>

      {/* ─────────────────────────────────────────────────────────────────────── */}
      {/* DIRECTOR'S NOTES */}
      {/* ─────────────────────────────────────────────────────────────────────── */}
      <Grid item xs={12}>
        <Divider sx={{ my: 2, bgcolor: 'rgba(255,255,255,0.1)' }} />
        <Typography variant="h6" sx={{ mb: 2, color: 'rgba(255,255,255,0.9)' }}>
          Director's Notes
        </Typography>
      </Grid>

      <Grid item xs={12}>
        <CustomTextField
          label="Section Label"
          value={directorsNotes.label || ''}
          onChange={(e) => updateDirectorsNotesLabel(e.target.value)}
          fullWidth
          placeholder="e.g. Director's Notes"
        />
      </Grid>

      <Grid item xs={12}>
        <Typography variant="subtitle2" sx={{ mb: 1, color: 'rgba(255,255,255,0.7)' }}>
          Paragraphs
        </Typography>
      </Grid>

      {notesParagraphs.map((paragraph, idx) => {
        const isDragging = draggedParagraphIndex === idx;
        const isDragOver = dragOverParagraphIndex === idx;

        return (
          <Grid item xs={12} key={idx}>
            <Box
              draggable
              onDragStart={() => handleParagraphDragStart(idx)}
              onDragOver={(e) => handleParagraphDragOver(e, idx)}
              onDragEnd={handleParagraphDragEnd}
              sx={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: 1,
                p: 2,
                bgcolor: 'rgba(255,255,255,0.03)',
                borderRadius: 2,
                border: isDragOver
                  ? '2px dashed rgba(20, 184, 166, 0.8)'
                  : '1px solid rgba(255,255,255,0.08)',
                opacity: isDragging ? 0.5 : 1,
                cursor: 'grab',
                transition: 'border 0.15s ease',
              }}
            >
              <DragIndicatorIcon sx={{ color: 'rgba(255,255,255,0.3)', mt: 1, flexShrink: 0 }} />
              <CustomTextField
                label={`Paragraph ${idx + 1}`}
                value={paragraph}
                onChange={(e) => updateNotesParagraph(idx, e.target.value)}
                fullWidth
                multiline
                rows={4}
              />
              <IconButton
                onClick={() => removeNotesParagraph(idx)}
                sx={{ color: 'rgba(255,255,255,0.5)', mt: 1 }}
                disabled={notesParagraphs.length <= 1}
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
          onClick={addNotesParagraph}
          variant="outlined"
          sx={{ borderColor: 'rgba(255,255,255,0.3)', color: 'rgba(255,255,255,0.9)' }}
        >
          Add Paragraph
        </Button>
      </Grid>

      {/* ─────────────────────────────────────────────────────────────────────── */}
      {/* CREDITS */}
      {/* ─────────────────────────────────────────────────────────────────────── */}
      <Grid item xs={12}>
        <Divider sx={{ my: 2, bgcolor: 'rgba(255,255,255,0.1)' }} />
        <Typography variant="h6" sx={{ mb: 2, color: 'rgba(255,255,255,0.9)' }}>
          Credits
        </Typography>
      </Grid>

      {credits.map((credit, idx) => {
        const isDragging = draggedCreditIndex === idx;
        const isDragOver = dragOverCreditIndex === idx;

        return (
          <Grid item xs={12} key={credit.id}>
            <Box
              draggable
              onDragStart={() => handleCreditDragStart(idx)}
              onDragOver={(e) => handleCreditDragOver(e, idx)}
              onDragEnd={handleCreditDragEnd}
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                p: 1.5,
                bgcolor: 'rgba(255,255,255,0.03)',
                borderRadius: 2,
                border: isDragOver
                  ? '2px dashed rgba(20, 184, 166, 0.8)'
                  : '1px solid rgba(255,255,255,0.08)',
                opacity: isDragging ? 0.5 : 1,
                cursor: 'grab',
                transition: 'border 0.15s ease',
              }}
            >
              <DragIndicatorIcon sx={{ color: 'rgba(255,255,255,0.3)', flexShrink: 0 }} />
              <CustomTextField
                label="Role"
                value={credit.role}
                onChange={(e) => updateCredit(idx, 'role', e.target.value)}
                size="small"
                sx={{ width: 150 }}
                placeholder="e.g. Location"
              />
              <CustomTextField
                label="Value"
                value={credit.value}
                onChange={(e) => updateCredit(idx, 'value', e.target.value)}
                fullWidth
                size="small"
                placeholder="e.g. New York City"
              />
              <IconButton
                onClick={() => removeCredit(idx)}
                sx={{ color: 'rgba(255,255,255,0.5)' }}
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
          onClick={addCredit}
          variant="outlined"
          size="small"
          sx={{ borderColor: 'rgba(255,255,255,0.3)', color: 'rgba(255,255,255,0.9)' }}
        >
          Add Credit
        </Button>
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
          value={flexC.ariaLabel || ''}
          onChange={(e) => onFlexCChange('ariaLabel', e.target.value)}
          fullWidth
          placeholder="e.g. Documentary section"
        />
      </Grid>
    </Grid>
  );
}

export default FlexCTabEditor;

