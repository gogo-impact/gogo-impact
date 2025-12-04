import React, { useState, useRef } from 'react';
import {
  Grid,
  Box,
  Typography,
  Button,
  Divider,
  IconButton,
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
import { FlexAContent, FlexAStat } from '../../services/impact.api';
import { signUpload, uploadToSignedUrl } from '../../services/upload.api';

export interface FlexATabEditorProps {
  flexA: FlexAContent;
  defaultSwatch: string[] | null;
  onFlexAChange: (field: keyof FlexAContent, value: any) => void;
}

type FlexAColorPickerField =
  | 'primaryColor'
  | 'textColor'
  | 'labelTextColor'
  | 'headlineColor'
  | 'subtitleColor'
  | 'heroOverlayColor'
  | 'quoteBgColor'
  | 'quoteTextColor'
  | 'quoteAuthorColor'
  | 'sidebarBgColor'
  | 'sidebarBorderColor'
  | 'sidebarTitleColor'
  | 'sidebarTitleBorderColor'
  | 'statNumberColor'
  | 'statLabelColor';

export function FlexATabEditor({
  flexA,
  defaultSwatch,
  onFlexAChange,
}: FlexATabEditorProps) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [colorPickerAnchor, setColorPickerAnchor] = useState<HTMLElement | null>(null);
  const [colorPickerField, setColorPickerField] = useState<FlexAColorPickerField | null>(null);

  // Drag state for paragraphs
  const [draggedParagraphIndex, setDraggedParagraphIndex] = useState<number | null>(null);
  const [dragOverParagraphIndex, setDragOverParagraphIndex] = useState<number | null>(null);

  // Drag state for stats
  const [draggedStatIndex, setDraggedStatIndex] = useState<number | null>(null);
  const [dragOverStatIndex, setDragOverStatIndex] = useState<number | null>(null);

  // State for gradient color picker
  const [gradientPickerAnchor, setGradientPickerAnchor] = useState<HTMLElement | null>(null);
  const [gradientPickerKey, setGradientPickerKey] = useState<'sectionBgGradient' | null>(null);
  const [gradientPickerColorIndex, setGradientPickerColorIndex] = useState<number>(0);
  const gradientPickerOpen = Boolean(gradientPickerAnchor);

  // Image upload state
  const [uploading, setUploading] = useState(false);
  const [cropperOpen, setCropperOpen] = useState(false);
  const [cropperImageSrc, setCropperImageSrc] = useState('');

  // Get gradient value
  const getGradientValue = (key: 'sectionBgGradient'): string => {
    return flexA.sectionBgGradient || '';
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
      onFlexAChange(gradientPickerKey, newGradient);
      return;
    }
    const parsed = parseGradientString(currentGradient);
    const newColors = [...parsed.colors];
    newColors[gradientPickerColorIndex] = color;
    const newGradient = composeGradient(parsed.type, parsed.degree, newColors, parsed.opacity);
    onFlexAChange(gradientPickerKey, newGradient);
  };

  const closeGradientPicker = () => {
    setGradientPickerAnchor(null);
    setGradientPickerKey(null);
  };

  // Color picker helpers
  const openColorPicker = (el: HTMLElement, field: FlexAColorPickerField) => {
    setColorPickerField(field);
    setColorPickerAnchor(el);
  };

  const handleColorChange = (color: string) => {
    if (colorPickerField) {
      onFlexAChange(colorPickerField, color);
    }
  };

  const closeColorPicker = () => {
    setColorPickerAnchor(null);
    setColorPickerField(null);
  };

  // Get color value
  const getColorValue = (field: FlexAColorPickerField): string => {
    switch (field) {
      case 'primaryColor':
        return flexA.primaryColor || '';
      case 'textColor':
        return flexA.textColor || '';
      case 'labelTextColor':
        return flexA.labelTextColor || '';
      case 'headlineColor':
        return flexA.headlineColor || '';
      case 'subtitleColor':
        return flexA.subtitleColor || '';
      case 'heroOverlayColor':
        return flexA.heroOverlayColor || '';
      case 'quoteBgColor':
        return flexA.quoteBgColor || '';
      case 'quoteTextColor':
        return flexA.quoteTextColor || '';
      case 'quoteAuthorColor':
        return flexA.quoteAuthorColor || '';
      case 'sidebarBgColor':
        return flexA.sidebarBgColor || '';
      case 'sidebarBorderColor':
        return flexA.sidebarBorderColor || '';
      case 'sidebarTitleColor':
        return flexA.sidebarTitleColor || '';
      case 'sidebarTitleBorderColor':
        return flexA.sidebarTitleBorderColor || '';
      case 'statNumberColor':
        return flexA.statNumberColor || '';
      case 'statLabelColor':
        return flexA.statLabelColor || '';
      default:
        return '';
    }
  };

  // Paragraphs helpers
  const paragraphs: string[] = flexA.paragraphs ?? [];

  const addParagraph = () => {
    onFlexAChange('paragraphs', [...paragraphs, '']);
  };

  const updateParagraph = (index: number, value: string) => {
    const updated = [...paragraphs];
    updated[index] = value;
    onFlexAChange('paragraphs', updated);
  };

  const removeParagraph = (index: number) => {
    const updated = paragraphs.filter((_, i) => i !== index);
    onFlexAChange('paragraphs', updated);
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
      const items = [...paragraphs];
      const [removed] = items.splice(draggedParagraphIndex, 1);
      items.splice(dragOverParagraphIndex, 0, removed);
      onFlexAChange('paragraphs', items);
    }
    setDraggedParagraphIndex(null);
    setDragOverParagraphIndex(null);
  };

  // Stats helpers
  const stats: FlexAStat[] = flexA.sidebar?.stats ?? [];

  const addStat = () => {
    const newStat: FlexAStat = {
      id: `stat-${Date.now()}`,
      number: '',
      label: '',
    };
    onFlexAChange('sidebar', {
      ...flexA.sidebar,
      stats: [...stats, newStat],
    });
  };

  const updateStat = (index: number, field: keyof FlexAStat, value: string) => {
    const updated = [...stats];
    updated[index] = { ...updated[index], [field]: value };
    onFlexAChange('sidebar', {
      ...flexA.sidebar,
      stats: updated,
    });
  };

  const removeStat = (index: number) => {
    const updated = stats.filter((_, i) => i !== index);
    onFlexAChange('sidebar', {
      ...flexA.sidebar,
      stats: updated,
    });
  };

  // Stat drag handlers
  const handleStatDragStart = (index: number) => {
    setDraggedStatIndex(index);
  };

  const handleStatDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedStatIndex !== null && draggedStatIndex !== index) {
      setDragOverStatIndex(index);
    }
  };

  const handleStatDragEnd = () => {
    if (
      draggedStatIndex !== null &&
      dragOverStatIndex !== null &&
      draggedStatIndex !== dragOverStatIndex
    ) {
      const items = [...stats];
      const [removed] = items.splice(draggedStatIndex, 1);
      items.splice(dragOverStatIndex, 0, removed);
      onFlexAChange('sidebar', {
        ...flexA.sidebar,
        stats: items,
      });
    }
    setDraggedStatIndex(null);
    setDragOverStatIndex(null);
  };

  // Header helpers
  const header = flexA.header ?? { label: '', title: '', titleHighlight: '', subtitle: '' };

  const updateHeader = (field: string, value: string) => {
    onFlexAChange('header', {
      ...header,
      [field]: value,
    });
  };

  // Hero image helpers
  const heroImage = flexA.heroImage ?? { url: '', alt: '' };

  const updateHeroImage = (field: string, value: string) => {
    onFlexAChange('heroImage', {
      ...heroImage,
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
        folder: 'flex-a',
      });

      const putRes = await uploadToSignedUrl({
        uploadUrl: signed.uploadUrl,
        file: croppedBlob,
        contentType: 'image/jpeg',
      });

      if (!putRes.ok) {
        throw new Error('Failed to upload cropped image');
      }

      updateHeroImage('url', signed.publicUrl);
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
    updateHeroImage('url', '');
  };

  // Quote helpers
  const quote = flexA.quote ?? { text: '', author: '', insertAfterParagraph: 1 };

  const updateQuote = (field: string, value: string | number) => {
    onFlexAChange('quote', {
      ...quote,
      [field]: value,
    });
  };

  // Sidebar title helper
  const updateSidebarTitle = (value: string) => {
    onFlexAChange('sidebar', {
      ...flexA.sidebar,
      title: value,
    });
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
          onChange={(gradient) => onFlexAChange('sectionBgGradient', gradient)}
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
          Primary Colors
        </Typography>
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mb: 2 }}>
          <Button
            size="small"
            variant="outlined"
            onClick={(e) => openColorPicker(e.currentTarget, 'primaryColor')}
            sx={{ borderColor: 'rgba(255,255,255,0.3)', color: 'rgba(255,255,255,0.9)' }}
          >
            <span style={{ display: 'inline-block', width: 16, height: 16, borderRadius: 3, background: flexA.primaryColor || 'transparent', border: '1px solid rgba(255,255,255,0.2)' }} />
            &nbsp;Primary accent
          </Button>
          <Button
            size="small"
            variant="outlined"
            onClick={(e) => openColorPicker(e.currentTarget, 'textColor')}
            sx={{ borderColor: 'rgba(255,255,255,0.3)', color: 'rgba(255,255,255,0.9)' }}
          >
            <span style={{ display: 'inline-block', width: 16, height: 16, borderRadius: 3, background: flexA.textColor || 'transparent', border: '1px solid rgba(255,255,255,0.2)' }} />
            &nbsp;Text color
          </Button>
        </Box>

        <Typography variant="subtitle2" sx={{ mb: 1, color: 'rgba(255,255,255,0.7)' }}>
          Header Colors
        </Typography>
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mb: 2 }}>
          <Button
            size="small"
            variant="outlined"
            onClick={(e) => openColorPicker(e.currentTarget, 'labelTextColor')}
            sx={{ borderColor: 'rgba(255,255,255,0.3)', color: 'rgba(255,255,255,0.9)' }}
          >
            <span style={{ display: 'inline-block', width: 16, height: 16, borderRadius: 3, background: flexA.labelTextColor || '#111', border: '1px solid rgba(255,255,255,0.2)' }} />
            &nbsp;Label text
          </Button>
          <Button
            size="small"
            variant="outlined"
            onClick={(e) => openColorPicker(e.currentTarget, 'headlineColor')}
            sx={{ borderColor: 'rgba(255,255,255,0.3)', color: 'rgba(255,255,255,0.9)' }}
          >
            <span style={{ display: 'inline-block', width: 16, height: 16, borderRadius: 3, background: flexA.headlineColor || '#fff', border: '1px solid rgba(255,255,255,0.2)' }} />
            &nbsp;Headline
          </Button>
          <Button
            size="small"
            variant="outlined"
            onClick={(e) => openColorPicker(e.currentTarget, 'subtitleColor')}
            sx={{ borderColor: 'rgba(255,255,255,0.3)', color: 'rgba(255,255,255,0.9)' }}
          >
            <span style={{ display: 'inline-block', width: 16, height: 16, borderRadius: 3, background: flexA.subtitleColor || 'rgba(255,255,255,0.7)', border: '1px solid rgba(255,255,255,0.2)' }} />
            &nbsp;Subtitle
          </Button>
        </Box>

        <Typography variant="subtitle2" sx={{ mb: 1, color: 'rgba(255,255,255,0.7)' }}>
          Quote Colors
        </Typography>
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mb: 2 }}>
          <Button
            size="small"
            variant="outlined"
            onClick={(e) => openColorPicker(e.currentTarget, 'quoteBgColor')}
            sx={{ borderColor: 'rgba(255,255,255,0.3)', color: 'rgba(255,255,255,0.9)' }}
          >
            <span style={{ display: 'inline-block', width: 16, height: 16, borderRadius: 3, background: flexA.quoteBgColor || 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.2)' }} />
            &nbsp;Quote background
          </Button>
          <Button
            size="small"
            variant="outlined"
            onClick={(e) => openColorPicker(e.currentTarget, 'quoteTextColor')}
            sx={{ borderColor: 'rgba(255,255,255,0.3)', color: 'rgba(255,255,255,0.9)' }}
          >
            <span style={{ display: 'inline-block', width: 16, height: 16, borderRadius: 3, background: flexA.quoteTextColor || '#fff', border: '1px solid rgba(255,255,255,0.2)' }} />
            &nbsp;Quote text
          </Button>
          <Button
            size="small"
            variant="outlined"
            onClick={(e) => openColorPicker(e.currentTarget, 'quoteAuthorColor')}
            sx={{ borderColor: 'rgba(255,255,255,0.3)', color: 'rgba(255,255,255,0.9)' }}
          >
            <span style={{ display: 'inline-block', width: 16, height: 16, borderRadius: 3, background: flexA.quoteAuthorColor || 'rgba(255,255,255,0.6)', border: '1px solid rgba(255,255,255,0.2)' }} />
            &nbsp;Quote author
          </Button>
        </Box>

        <Typography variant="subtitle2" sx={{ mb: 1, color: 'rgba(255,255,255,0.7)' }}>
          Sidebar Colors
        </Typography>
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mb: 2 }}>
          <Button
            size="small"
            variant="outlined"
            onClick={(e) => openColorPicker(e.currentTarget, 'sidebarBgColor')}
            sx={{ borderColor: 'rgba(255,255,255,0.3)', color: 'rgba(255,255,255,0.9)' }}
          >
            <span style={{ display: 'inline-block', width: 16, height: 16, borderRadius: 3, background: flexA.sidebarBgColor || '#1a1a1a', border: '1px solid rgba(255,255,255,0.2)' }} />
            &nbsp;Sidebar background
          </Button>
          <Button
            size="small"
            variant="outlined"
            onClick={(e) => openColorPicker(e.currentTarget, 'sidebarBorderColor')}
            sx={{ borderColor: 'rgba(255,255,255,0.3)', color: 'rgba(255,255,255,0.9)' }}
          >
            <span style={{ display: 'inline-block', width: 16, height: 16, borderRadius: 3, background: flexA.sidebarBorderColor || 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.2)' }} />
            &nbsp;Sidebar border
          </Button>
          <Button
            size="small"
            variant="outlined"
            onClick={(e) => openColorPicker(e.currentTarget, 'sidebarTitleColor')}
            sx={{ borderColor: 'rgba(255,255,255,0.3)', color: 'rgba(255,255,255,0.9)' }}
          >
            <span style={{ display: 'inline-block', width: 16, height: 16, borderRadius: 3, background: flexA.sidebarTitleColor || 'rgba(255,255,255,0.5)', border: '1px solid rgba(255,255,255,0.2)' }} />
            &nbsp;Sidebar title
          </Button>
          <Button
            size="small"
            variant="outlined"
            onClick={(e) => openColorPicker(e.currentTarget, 'sidebarTitleBorderColor')}
            sx={{ borderColor: 'rgba(255,255,255,0.3)', color: 'rgba(255,255,255,0.9)' }}
          >
            <span style={{ display: 'inline-block', width: 16, height: 16, borderRadius: 3, background: flexA.sidebarTitleBorderColor || 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)' }} />
            &nbsp;Title underline
          </Button>
        </Box>

        <Typography variant="subtitle2" sx={{ mb: 1, color: 'rgba(255,255,255,0.7)' }}>
          Stat Colors
        </Typography>
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mb: 2 }}>
          <Button
            size="small"
            variant="outlined"
            onClick={(e) => openColorPicker(e.currentTarget, 'statNumberColor')}
            sx={{ borderColor: 'rgba(255,255,255,0.3)', color: 'rgba(255,255,255,0.9)' }}
          >
            <span style={{ display: 'inline-block', width: 16, height: 16, borderRadius: 3, background: flexA.statNumberColor || '#fff', border: '1px solid rgba(255,255,255,0.2)' }} />
            &nbsp;Stat number
          </Button>
          <Button
            size="small"
            variant="outlined"
            onClick={(e) => openColorPicker(e.currentTarget, 'statLabelColor')}
            sx={{ borderColor: 'rgba(255,255,255,0.3)', color: 'rgba(255,255,255,0.9)' }}
          >
            <span style={{ display: 'inline-block', width: 16, height: 16, borderRadius: 3, background: flexA.statLabelColor || 'rgba(255,255,255,0.7)', border: '1px solid rgba(255,255,255,0.2)' }} />
            &nbsp;Stat label
          </Button>
        </Box>

        <Typography variant="subtitle2" sx={{ mb: 1, color: 'rgba(255,255,255,0.7)' }}>
          Hero Image
        </Typography>
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <Button
            size="small"
            variant="outlined"
            onClick={(e) => openColorPicker(e.currentTarget, 'heroOverlayColor')}
            sx={{ borderColor: 'rgba(255,255,255,0.3)', color: 'rgba(255,255,255,0.9)' }}
          >
            <span style={{ display: 'inline-block', width: 16, height: 16, borderRadius: 3, background: flexA.heroOverlayColor || 'rgba(15,15,15,0.9)', border: '1px solid rgba(255,255,255,0.2)' }} />
            &nbsp;Image overlay
          </Button>
        </Box>
      </Grid>

      {/* ─────────────────────────────────────────────────────────────────────── */}
      {/* BORDER RADII */}
      {/* ─────────────────────────────────────────────────────────────────────── */}
      <Grid item xs={12}>
        <Divider sx={{ my: 2, bgcolor: 'rgba(255,255,255,0.1)' }} />
        <Typography variant="h6" sx={{ mb: 2, color: 'rgba(255,255,255,0.9)' }}>
          Border Radii
        </Typography>
      </Grid>

      <Grid item xs={12} md={4}>
        <CustomTextField
          label="Hero Image Border Radius"
          type="number"
          value={flexA.heroImageBorderRadius ?? 24}
          onChange={(e) => onFlexAChange('heroImageBorderRadius', parseInt(e.target.value) || 0)}
          fullWidth
          InputProps={{ inputProps: { min: 0, max: 100 } }}
          helperText="Default: 24px"
        />
      </Grid>

      <Grid item xs={12} md={4}>
        <CustomTextField
          label="Quote Border Radius"
          type="number"
          value={flexA.quoteBorderRadius ?? 12}
          onChange={(e) => onFlexAChange('quoteBorderRadius', parseInt(e.target.value) || 0)}
          fullWidth
          InputProps={{ inputProps: { min: 0, max: 100 } }}
          helperText="Default: 12px"
        />
      </Grid>

      <Grid item xs={12} md={4}>
        <CustomTextField
          label="Sidebar Border Radius"
          type="number"
          value={flexA.sidebarBorderRadius ?? 16}
          onChange={(e) => onFlexAChange('sidebarBorderRadius', parseInt(e.target.value) || 0)}
          fullWidth
          InputProps={{ inputProps: { min: 0, max: 100 } }}
          helperText="Default: 16px"
        />
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

      <Grid item xs={12} md={6}>
        <CustomTextField
          label="Label (Badge)"
          value={header.label || ''}
          onChange={(e) => updateHeader('label', e.target.value)}
          fullWidth
          placeholder="e.g. Program Spotlight"
        />
      </Grid>

      <Grid item xs={12} md={6}>
        <CustomTextField
          label="Title"
          value={header.title || ''}
          onChange={(e) => updateHeader('title', e.target.value)}
          fullWidth
          placeholder="e.g. The Heartbeat of"
        />
      </Grid>

      <Grid item xs={12} md={6}>
        <CustomTextField
          label="Title Highlight"
          value={header.titleHighlight || ''}
          onChange={(e) => updateHeader('titleHighlight', e.target.value)}
          fullWidth
          placeholder="e.g. Overtown"
          helperText="This word will be styled with the primary color"
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
          placeholder="e.g. How a historic neighborhood became the stage for our most ambitious summer program yet."
        />
      </Grid>

      {/* ─────────────────────────────────────────────────────────────────────── */}
      {/* HERO IMAGE */}
      {/* ─────────────────────────────────────────────────────────────────────── */}
      <Grid item xs={12}>
        <Divider sx={{ my: 2, bgcolor: 'rgba(255,255,255,0.1)' }} />
        <Typography variant="h6" sx={{ mb: 2, color: 'rgba(255,255,255,0.9)' }}>
          Hero Image
        </Typography>
      </Grid>

      <Grid item xs={12}>
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileSelect}
          accept="image/jpeg,image/png,image/webp"
          style={{ display: 'none' }}
        />
        
        {heroImage.url ? (
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
                src={heroImage.url}
                alt={heroImage.alt || 'Hero image preview'}
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
                  <CircularProgress size={32} sx={{ color: '#1DB954' }} />
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
                Replace Image
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
              <CircularProgress size={32} sx={{ color: '#1DB954' }} />
            ) : (
              <>
                <CloudUploadIcon sx={{ fontSize: 48, color: 'rgba(255,255,255,0.4)', mb: 1 }} />
                <Typography sx={{ color: 'rgba(255,255,255,0.6)' }}>
                  Click to upload hero image
                </Typography>
                <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.4)' }}>
                  JPG, PNG, or WebP
                </Typography>
              </>
            )}
          </Box>
        )}
      </Grid>

      <Grid item xs={12}>
        <CustomTextField
          label="Alt Text"
          value={heroImage.alt || ''}
          onChange={(e) => updateHeroImage('alt', e.target.value)}
          fullWidth
          placeholder="Describe the image for accessibility"
        />
      </Grid>

      {/* Image Cropper Modal */}
      <ImageCropper
        open={cropperOpen}
        imageSrc={cropperImageSrc}
        onClose={handleCropperClose}
        onCropComplete={handleCroppedImageUpload}
        aspectRatio={16 / 9}
        outputWidth={1920}
        outputHeight={1080}
      />

      {/* ─────────────────────────────────────────────────────────────────────── */}
      {/* ARTICLE PARAGRAPHS */}
      {/* ─────────────────────────────────────────────────────────────────────── */}
      <Grid item xs={12}>
        <Divider sx={{ my: 2, bgcolor: 'rgba(255,255,255,0.1)' }} />
        <Typography variant="h6" sx={{ mb: 2, color: 'rgba(255,255,255,0.9)' }}>
          Article Paragraphs
        </Typography>
      </Grid>

      {paragraphs.map((paragraph, idx) => {
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
                  ? '2px dashed rgba(30, 215, 96, 0.8)'
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
                onChange={(e) => updateParagraph(idx, e.target.value)}
                fullWidth
                multiline
                rows={4}
              />
              <IconButton
                onClick={() => removeParagraph(idx)}
                sx={{ color: 'rgba(255,255,255,0.5)', mt: 1 }}
                disabled={paragraphs.length <= 1}
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
          onClick={addParagraph}
          variant="outlined"
          sx={{ borderColor: 'rgba(255,255,255,0.3)', color: 'rgba(255,255,255,0.9)' }}
        >
          Add Paragraph
        </Button>
      </Grid>

      {/* ─────────────────────────────────────────────────────────────────────── */}
      {/* QUOTE */}
      {/* ─────────────────────────────────────────────────────────────────────── */}
      <Grid item xs={12}>
        <Divider sx={{ my: 2, bgcolor: 'rgba(255,255,255,0.1)' }} />
        <Typography variant="h6" sx={{ mb: 2, color: 'rgba(255,255,255,0.9)' }}>
          Quote
        </Typography>
      </Grid>

      <Grid item xs={12}>
        <CustomTextField
          label="Quote Text"
          value={quote.text || ''}
          onChange={(e) => updateQuote('text', e.target.value)}
          fullWidth
          multiline
          rows={3}
          placeholder="Enter the quote text..."
        />
      </Grid>

      <Grid item xs={12} md={6}>
        <CustomTextField
          label="Author"
          value={quote.author || ''}
          onChange={(e) => updateQuote('author', e.target.value)}
          fullWidth
          placeholder="e.g. OYC Student, Class of 2024"
        />
      </Grid>

      <Grid item xs={12} md={6}>
        <CustomTextField
          label="Insert After Paragraph #"
          type="number"
          value={quote.insertAfterParagraph ?? 1}
          onChange={(e) => updateQuote('insertAfterParagraph', Math.max(0, parseInt(e.target.value) || 0))}
          fullWidth
          helperText="0 = before first paragraph, 1 = after first paragraph, etc."
        />
      </Grid>

      {/* ─────────────────────────────────────────────────────────────────────── */}
      {/* SIDEBAR */}
      {/* ─────────────────────────────────────────────────────────────────────── */}
      <Grid item xs={12}>
        <Divider sx={{ my: 2, bgcolor: 'rgba(255,255,255,0.1)' }} />
        <Typography variant="h6" sx={{ mb: 2, color: 'rgba(255,255,255,0.9)' }}>
          Sidebar
        </Typography>
      </Grid>

      <Grid item xs={12}>
        <CustomTextField
          label="Sidebar Title"
          value={flexA.sidebar?.title || ''}
          onChange={(e) => updateSidebarTitle(e.target.value)}
          fullWidth
          placeholder="e.g. By the Numbers"
        />
      </Grid>

      <Grid item xs={12}>
        <Typography variant="subtitle2" sx={{ mb: 1, color: 'rgba(255,255,255,0.7)' }}>
          Stats
        </Typography>
      </Grid>

      {stats.map((stat, idx) => {
        const isDragging = draggedStatIndex === idx;
        const isDragOver = dragOverStatIndex === idx;

        return (
          <Grid item xs={12} key={stat.id}>
            <Box
              draggable
              onDragStart={() => handleStatDragStart(idx)}
              onDragOver={(e) => handleStatDragOver(e, idx)}
              onDragEnd={handleStatDragEnd}
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 2,
                p: 2,
                bgcolor: 'rgba(255,255,255,0.03)',
                borderRadius: 2,
                border: isDragOver
                  ? '2px dashed rgba(30, 215, 96, 0.8)'
                  : '1px solid rgba(255,255,255,0.08)',
                opacity: isDragging ? 0.5 : 1,
                cursor: 'grab',
                transition: 'border 0.15s ease',
              }}
            >
              <DragIndicatorIcon sx={{ color: 'rgba(255,255,255,0.3)', flexShrink: 0 }} />
              <CustomTextField
                label="Number"
                value={stat.number}
                onChange={(e) => updateStat(idx, 'number', e.target.value)}
                sx={{ flex: 1 }}
                placeholder="e.g. 18 or 100%"
              />
              <CustomTextField
                label="Label"
                value={stat.label}
                onChange={(e) => updateStat(idx, 'label', e.target.value)}
                sx={{ flex: 2 }}
                placeholder="e.g. Active Mentors"
              />
              <IconButton
                onClick={() => removeStat(idx)}
                sx={{ color: 'rgba(255,255,255,0.5)' }}
                disabled={stats.length <= 1}
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
          onClick={addStat}
          variant="outlined"
          sx={{ borderColor: 'rgba(255,255,255,0.3)', color: 'rgba(255,255,255,0.9)' }}
        >
          Add Stat
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
          value={flexA.ariaLabel || ''}
          onChange={(e) => onFlexAChange('ariaLabel', e.target.value)}
          fullWidth
          placeholder="e.g. Program spotlight section"
        />
      </Grid>
    </Grid>
  );
}

export default FlexATabEditor;

