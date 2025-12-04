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
import { FlexBContent } from '../../services/impact.api';
import { signUpload, uploadToSignedUrl } from '../../services/upload.api';

export interface FlexBTabEditorProps {
  flexB: FlexBContent;
  defaultSwatch: string[] | null;
  onFlexBChange: (field: keyof FlexBContent, value: any) => void;
}

type FlexBColorPickerField =
  | 'primaryColor'
  | 'labelTextColor'
  | 'headlineColor'
  | 'leadParagraphColor'
  | 'bodyTextColor'
  | 'pullQuoteBgColor'
  | 'pullQuoteTextColor'
  | 'pullQuoteAuthorColor'
  | 'sidebarBgColor'
  | 'sidebarBorderColor'
  | 'sidebarTitleColor'
  | 'bulletTextColor'
  | 'bulletMarkerColor'
  | 'keyTakeawayBgColor'
  | 'keyTakeawayTextColor';

export function FlexBTabEditor({
  flexB,
  defaultSwatch,
  onFlexBChange,
}: FlexBTabEditorProps) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [colorPickerAnchor, setColorPickerAnchor] = useState<HTMLElement | null>(null);
  const [colorPickerField, setColorPickerField] = useState<FlexBColorPickerField | null>(null);

  // Drag state for body paragraphs
  const [draggedParagraphIndex, setDraggedParagraphIndex] = useState<number | null>(null);
  const [dragOverParagraphIndex, setDragOverParagraphIndex] = useState<number | null>(null);

  // Drag state for bullets
  const [draggedBulletIndex, setDraggedBulletIndex] = useState<number | null>(null);
  const [dragOverBulletIndex, setDragOverBulletIndex] = useState<number | null>(null);

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
    return flexB.sectionBgGradient || '';
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
      onFlexBChange(gradientPickerKey, newGradient);
      return;
    }
    const parsed = parseGradientString(currentGradient);
    const newColors = [...parsed.colors];
    newColors[gradientPickerColorIndex] = color;
    const newGradient = composeGradient(parsed.type, parsed.degree, newColors, parsed.opacity);
    onFlexBChange(gradientPickerKey, newGradient);
  };

  const closeGradientPicker = () => {
    setGradientPickerAnchor(null);
    setGradientPickerKey(null);
  };

  // Color picker helpers
  const openColorPicker = (el: HTMLElement, field: FlexBColorPickerField) => {
    setColorPickerField(field);
    setColorPickerAnchor(el);
  };

  const handleColorChange = (color: string) => {
    if (colorPickerField) {
      onFlexBChange(colorPickerField, color);
    }
  };

  const closeColorPicker = () => {
    setColorPickerAnchor(null);
    setColorPickerField(null);
  };

  // Get color value
  const getColorValue = (field: FlexBColorPickerField): string => {
    switch (field) {
      case 'primaryColor':
        return flexB.primaryColor || '';
      case 'labelTextColor':
        return flexB.labelTextColor || '';
      case 'headlineColor':
        return flexB.headlineColor || '';
      case 'leadParagraphColor':
        return flexB.leadParagraphColor || '';
      case 'bodyTextColor':
        return flexB.bodyTextColor || '';
      case 'pullQuoteBgColor':
        return flexB.pullQuoteBgColor || '';
      case 'pullQuoteTextColor':
        return flexB.pullQuoteTextColor || '';
      case 'pullQuoteAuthorColor':
        return flexB.pullQuoteAuthorColor || '';
      case 'sidebarBgColor':
        return flexB.sidebarBgColor || '';
      case 'sidebarBorderColor':
        return flexB.sidebarBorderColor || '';
      case 'sidebarTitleColor':
        return flexB.sidebarTitleColor || '';
      case 'bulletTextColor':
        return flexB.bulletTextColor || '';
      case 'bulletMarkerColor':
        return flexB.bulletMarkerColor || '';
      case 'keyTakeawayBgColor':
        return flexB.keyTakeawayBgColor || '';
      case 'keyTakeawayTextColor':
        return flexB.keyTakeawayTextColor || '';
      default:
        return '';
    }
  };

  // Header helpers
  const header = flexB.header ?? { label: '', headline: '' };

  const updateHeader = (field: string, value: string) => {
    onFlexBChange('header', {
      ...header,
      [field]: value,
    });
  };

  // Body paragraphs helpers
  const bodyParagraphs: string[] = flexB.bodyParagraphs ?? [];

  const addBodyParagraph = () => {
    onFlexBChange('bodyParagraphs', [...bodyParagraphs, '']);
  };

  const updateBodyParagraph = (index: number, value: string) => {
    const updated = [...bodyParagraphs];
    updated[index] = value;
    onFlexBChange('bodyParagraphs', updated);
  };

  const removeBodyParagraph = (index: number) => {
    const updated = bodyParagraphs.filter((_, i) => i !== index);
    onFlexBChange('bodyParagraphs', updated);
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
      const items = [...bodyParagraphs];
      const [removed] = items.splice(draggedParagraphIndex, 1);
      items.splice(dragOverParagraphIndex, 0, removed);
      onFlexBChange('bodyParagraphs', items);
    }
    setDraggedParagraphIndex(null);
    setDragOverParagraphIndex(null);
  };

  // Pull quote helpers
  const pullQuote = flexB.pullQuote ?? { text: '', author: '', insertAfterParagraph: 1 };

  const updatePullQuote = (field: string, value: string | number) => {
    onFlexBChange('pullQuote', {
      ...pullQuote,
      [field]: value,
    });
  };

  // Sidebar helpers
  const sidebar = flexB.sidebar ?? { imageUrl: '', imageAlt: '', title: '', bullets: [] };

  const updateSidebar = (field: string, value: any) => {
    onFlexBChange('sidebar', {
      ...sidebar,
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
        folder: 'flex-b',
      });

      const putRes = await uploadToSignedUrl({
        uploadUrl: signed.uploadUrl,
        file: croppedBlob,
        contentType: 'image/jpeg',
      });

      if (!putRes.ok) {
        throw new Error('Failed to upload cropped image');
      }

      updateSidebar('imageUrl', signed.publicUrl);
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
    updateSidebar('imageUrl', '');
  };

  // Sidebar bullets helpers
  const bullets: string[] = sidebar.bullets ?? [];

  const addBullet = () => {
    updateSidebar('bullets', [...bullets, '']);
  };

  const updateBullet = (index: number, value: string) => {
    const updated = [...bullets];
    updated[index] = value;
    updateSidebar('bullets', updated);
  };

  const removeBullet = (index: number) => {
    const updated = bullets.filter((_, i) => i !== index);
    updateSidebar('bullets', updated);
  };

  // Bullet drag handlers
  const handleBulletDragStart = (index: number) => {
    setDraggedBulletIndex(index);
  };

  const handleBulletDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedBulletIndex !== null && draggedBulletIndex !== index) {
      setDragOverBulletIndex(index);
    }
  };

  const handleBulletDragEnd = () => {
    if (
      draggedBulletIndex !== null &&
      dragOverBulletIndex !== null &&
      draggedBulletIndex !== dragOverBulletIndex
    ) {
      const items = [...bullets];
      const [removed] = items.splice(draggedBulletIndex, 1);
      items.splice(dragOverBulletIndex, 0, removed);
      updateSidebar('bullets', items);
    }
    setDraggedBulletIndex(null);
    setDragOverBulletIndex(null);
  };

  // Key takeaway helpers
  const keyTakeaway = flexB.keyTakeaway ?? { text: '' };

  const updateKeyTakeaway = (value: string) => {
    onFlexBChange('keyTakeaway', { text: value });
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
          onChange={(gradient) => onFlexBChange('sectionBgGradient', gradient)}
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
            <span style={{ display: 'inline-block', width: 16, height: 16, borderRadius: 3, background: flexB.primaryColor || 'transparent', border: '1px solid rgba(255,255,255,0.2)' }} />
            &nbsp;Primary accent
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
            <span style={{ display: 'inline-block', width: 16, height: 16, borderRadius: 3, background: flexB.labelTextColor || '#fff', border: '1px solid rgba(255,255,255,0.2)' }} />
            &nbsp;Label text
          </Button>
          <Button
            size="small"
            variant="outlined"
            onClick={(e) => openColorPicker(e.currentTarget, 'headlineColor')}
            sx={{ borderColor: 'rgba(255,255,255,0.3)', color: 'rgba(255,255,255,0.9)' }}
          >
            <span style={{ display: 'inline-block', width: 16, height: 16, borderRadius: 3, background: flexB.headlineColor || '#fff', border: '1px solid rgba(255,255,255,0.2)' }} />
            &nbsp;Headline
          </Button>
        </Box>

        <Typography variant="subtitle2" sx={{ mb: 1, color: 'rgba(255,255,255,0.7)' }}>
          Text Colors
        </Typography>
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mb: 2 }}>
          <Button
            size="small"
            variant="outlined"
            onClick={(e) => openColorPicker(e.currentTarget, 'leadParagraphColor')}
            sx={{ borderColor: 'rgba(255,255,255,0.3)', color: 'rgba(255,255,255,0.9)' }}
          >
            <span style={{ display: 'inline-block', width: 16, height: 16, borderRadius: 3, background: flexB.leadParagraphColor || 'rgba(255,255,255,0.9)', border: '1px solid rgba(255,255,255,0.2)' }} />
            &nbsp;Lead paragraph
          </Button>
          <Button
            size="small"
            variant="outlined"
            onClick={(e) => openColorPicker(e.currentTarget, 'bodyTextColor')}
            sx={{ borderColor: 'rgba(255,255,255,0.3)', color: 'rgba(255,255,255,0.9)' }}
          >
            <span style={{ display: 'inline-block', width: 16, height: 16, borderRadius: 3, background: flexB.bodyTextColor || 'rgba(255,255,255,0.75)', border: '1px solid rgba(255,255,255,0.2)' }} />
            &nbsp;Body text
          </Button>
        </Box>

        <Typography variant="subtitle2" sx={{ mb: 1, color: 'rgba(255,255,255,0.7)' }}>
          Pull Quote Colors
        </Typography>
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mb: 2 }}>
          <Button
            size="small"
            variant="outlined"
            onClick={(e) => openColorPicker(e.currentTarget, 'pullQuoteBgColor')}
            sx={{ borderColor: 'rgba(255,255,255,0.3)', color: 'rgba(255,255,255,0.9)' }}
          >
            <span style={{ display: 'inline-block', width: 16, height: 16, borderRadius: 3, background: flexB.pullQuoteBgColor || 'rgba(124,77,255,0.1)', border: '1px solid rgba(255,255,255,0.2)' }} />
            &nbsp;Quote background
          </Button>
          <Button
            size="small"
            variant="outlined"
            onClick={(e) => openColorPicker(e.currentTarget, 'pullQuoteTextColor')}
            sx={{ borderColor: 'rgba(255,255,255,0.3)', color: 'rgba(255,255,255,0.9)' }}
          >
            <span style={{ display: 'inline-block', width: 16, height: 16, borderRadius: 3, background: flexB.pullQuoteTextColor || '#fff', border: '1px solid rgba(255,255,255,0.2)' }} />
            &nbsp;Quote text
          </Button>
          <Button
            size="small"
            variant="outlined"
            onClick={(e) => openColorPicker(e.currentTarget, 'pullQuoteAuthorColor')}
            sx={{ borderColor: 'rgba(255,255,255,0.3)', color: 'rgba(255,255,255,0.9)' }}
          >
            <span style={{ display: 'inline-block', width: 16, height: 16, borderRadius: 3, background: flexB.pullQuoteAuthorColor || '#7C4DFF', border: '1px solid rgba(255,255,255,0.2)' }} />
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
            <span style={{ display: 'inline-block', width: 16, height: 16, borderRadius: 3, background: flexB.sidebarBgColor || '#1a1a1a', border: '1px solid rgba(255,255,255,0.2)' }} />
            &nbsp;Sidebar background
          </Button>
          <Button
            size="small"
            variant="outlined"
            onClick={(e) => openColorPicker(e.currentTarget, 'sidebarBorderColor')}
            sx={{ borderColor: 'rgba(255,255,255,0.3)', color: 'rgba(255,255,255,0.9)' }}
          >
            <span style={{ display: 'inline-block', width: 16, height: 16, borderRadius: 3, background: flexB.sidebarBorderColor || 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.2)' }} />
            &nbsp;Sidebar border
          </Button>
          <Button
            size="small"
            variant="outlined"
            onClick={(e) => openColorPicker(e.currentTarget, 'sidebarTitleColor')}
            sx={{ borderColor: 'rgba(255,255,255,0.3)', color: 'rgba(255,255,255,0.9)' }}
          >
            <span style={{ display: 'inline-block', width: 16, height: 16, borderRadius: 3, background: flexB.sidebarTitleColor || '#fff', border: '1px solid rgba(255,255,255,0.2)' }} />
            &nbsp;Sidebar title
          </Button>
        </Box>

        <Typography variant="subtitle2" sx={{ mb: 1, color: 'rgba(255,255,255,0.7)' }}>
          Bullet List Colors
        </Typography>
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mb: 2 }}>
          <Button
            size="small"
            variant="outlined"
            onClick={(e) => openColorPicker(e.currentTarget, 'bulletTextColor')}
            sx={{ borderColor: 'rgba(255,255,255,0.3)', color: 'rgba(255,255,255,0.9)' }}
          >
            <span style={{ display: 'inline-block', width: 16, height: 16, borderRadius: 3, background: flexB.bulletTextColor || 'rgba(255,255,255,0.8)', border: '1px solid rgba(255,255,255,0.2)' }} />
            &nbsp;Bullet text
          </Button>
          <Button
            size="small"
            variant="outlined"
            onClick={(e) => openColorPicker(e.currentTarget, 'bulletMarkerColor')}
            sx={{ borderColor: 'rgba(255,255,255,0.3)', color: 'rgba(255,255,255,0.9)' }}
          >
            <span style={{ display: 'inline-block', width: 16, height: 16, borderRadius: 3, background: flexB.bulletMarkerColor || '#7C4DFF', border: '1px solid rgba(255,255,255,0.2)' }} />
            &nbsp;Bullet marker
          </Button>
        </Box>

        <Typography variant="subtitle2" sx={{ mb: 1, color: 'rgba(255,255,255,0.7)' }}>
          Key Takeaway Colors
        </Typography>
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <Button
            size="small"
            variant="outlined"
            onClick={(e) => openColorPicker(e.currentTarget, 'keyTakeawayBgColor')}
            sx={{ borderColor: 'rgba(255,255,255,0.3)', color: 'rgba(255,255,255,0.9)' }}
          >
            <span style={{ display: 'inline-block', width: 16, height: 16, borderRadius: 3, background: flexB.keyTakeawayBgColor || '#7C4DFF', border: '1px solid rgba(255,255,255,0.2)' }} />
            &nbsp;Takeaway background
          </Button>
          <Button
            size="small"
            variant="outlined"
            onClick={(e) => openColorPicker(e.currentTarget, 'keyTakeawayTextColor')}
            sx={{ borderColor: 'rgba(255,255,255,0.3)', color: 'rgba(255,255,255,0.9)' }}
          >
            <span style={{ display: 'inline-block', width: 16, height: 16, borderRadius: 3, background: flexB.keyTakeawayTextColor || '#fff', border: '1px solid rgba(255,255,255,0.2)' }} />
            &nbsp;Takeaway text
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
          label="Sidebar Border Radius"
          type="number"
          value={flexB.sidebarBorderRadius ?? 16}
          onChange={(e) => onFlexBChange('sidebarBorderRadius', parseInt(e.target.value) || 0)}
          fullWidth
          InputProps={{ inputProps: { min: 0, max: 100 } }}
          helperText="Default: 16px"
        />
      </Grid>

      <Grid item xs={12} md={4}>
        <CustomTextField
          label="Sidebar Image Border Radius"
          type="number"
          value={flexB.sidebarImageBorderRadius ?? 12}
          onChange={(e) => onFlexBChange('sidebarImageBorderRadius', parseInt(e.target.value) || 0)}
          fullWidth
          InputProps={{ inputProps: { min: 0, max: 100 } }}
          helperText="Default: 12px"
        />
      </Grid>

      <Grid item xs={12} md={4}>
        <CustomTextField
          label="Key Takeaway Border Radius"
          type="number"
          value={flexB.keyTakeawayBorderRadius ?? 12}
          onChange={(e) => onFlexBChange('keyTakeawayBorderRadius', parseInt(e.target.value) || 0)}
          fullWidth
          InputProps={{ inputProps: { min: 0, max: 100 } }}
          helperText="Default: 12px"
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

      <Grid item xs={12}>
        <CustomTextField
          label="Label (Badge)"
          value={header.label || ''}
          onChange={(e) => updateHeader('label', e.target.value)}
          fullWidth
          placeholder="e.g. Case Study: Restorative Justice"
        />
      </Grid>

      <Grid item xs={12}>
        <CustomTextField
          label="Headline"
          value={header.headline || ''}
          onChange={(e) => updateHeader('headline', e.target.value)}
          fullWidth
          placeholder="e.g. Rewriting the Narrative: A Different Outlook on Life"
        />
      </Grid>

      {/* ─────────────────────────────────────────────────────────────────────── */}
      {/* LEAD PARAGRAPH */}
      {/* ─────────────────────────────────────────────────────────────────────── */}
      <Grid item xs={12}>
        <Divider sx={{ my: 2, bgcolor: 'rgba(255,255,255,0.1)' }} />
        <Typography variant="h6" sx={{ mb: 2, color: 'rgba(255,255,255,0.9)' }}>
          Lead Paragraph
        </Typography>
      </Grid>

      <Grid item xs={12}>
        <CustomTextField
          label="Lead Paragraph"
          value={flexB.leadParagraph || ''}
          onChange={(e) => onFlexBChange('leadParagraph', e.target.value)}
          fullWidth
          multiline
          rows={3}
          placeholder="Enter the intro/lead paragraph..."
          helperText="Larger text that introduces the case study"
        />
      </Grid>

      {/* ─────────────────────────────────────────────────────────────────────── */}
      {/* BODY PARAGRAPHS */}
      {/* ─────────────────────────────────────────────────────────────────────── */}
      <Grid item xs={12}>
        <Divider sx={{ my: 2, bgcolor: 'rgba(255,255,255,0.1)' }} />
        <Typography variant="h6" sx={{ mb: 2, color: 'rgba(255,255,255,0.9)' }}>
          Body Paragraphs
        </Typography>
      </Grid>

      {bodyParagraphs.map((paragraph, idx) => {
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
                onChange={(e) => updateBodyParagraph(idx, e.target.value)}
                fullWidth
                multiline
                rows={4}
              />
              <IconButton
                onClick={() => removeBodyParagraph(idx)}
                sx={{ color: 'rgba(255,255,255,0.5)', mt: 1 }}
                disabled={bodyParagraphs.length <= 1}
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
          onClick={addBodyParagraph}
          variant="outlined"
          sx={{ borderColor: 'rgba(255,255,255,0.3)', color: 'rgba(255,255,255,0.9)' }}
        >
          Add Body Paragraph
        </Button>
      </Grid>

      {/* ─────────────────────────────────────────────────────────────────────── */}
      {/* PULL QUOTE */}
      {/* ─────────────────────────────────────────────────────────────────────── */}
      <Grid item xs={12}>
        <Divider sx={{ my: 2, bgcolor: 'rgba(255,255,255,0.1)' }} />
        <Typography variant="h6" sx={{ mb: 2, color: 'rgba(255,255,255,0.9)' }}>
          Pull Quote
        </Typography>
      </Grid>

      <Grid item xs={12}>
        <CustomTextField
          label="Quote Text"
          value={pullQuote.text || ''}
          onChange={(e) => updatePullQuote('text', e.target.value)}
          fullWidth
          multiline
          rows={3}
          placeholder="Enter the quote text..."
        />
      </Grid>

      <Grid item xs={12} md={6}>
        <CustomTextField
          label="Author"
          value={pullQuote.author || ''}
          onChange={(e) => updatePullQuote('author', e.target.value)}
          fullWidth
          placeholder="e.g. Participant, Spring 2024 Cohort"
        />
      </Grid>

      <Grid item xs={12} md={6}>
        <CustomTextField
          label="Insert After Paragraph #"
          type="number"
          value={pullQuote.insertAfterParagraph ?? 1}
          onChange={(e) => updatePullQuote('insertAfterParagraph', Math.max(0, parseInt(e.target.value) || 0))}
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
        <Typography variant="subtitle2" sx={{ mb: 1, color: 'rgba(255,255,255,0.7)' }}>
          Sidebar Image
        </Typography>
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileSelect}
          accept="image/jpeg,image/png,image/webp"
          style={{ display: 'none' }}
        />
        
        {sidebar.imageUrl ? (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Box
              sx={{
                position: 'relative',
                width: '100%',
                maxWidth: 300,
                aspectRatio: '1/1',
                borderRadius: 2,
                overflow: 'hidden',
                border: '1px solid rgba(255,255,255,0.1)',
              }}
            >
              <img
                src={sidebar.imageUrl}
                alt={sidebar.imageAlt || 'Sidebar image preview'}
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
                  <CircularProgress size={32} sx={{ color: '#7C4DFF' }} />
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
              <CircularProgress size={32} sx={{ color: '#7C4DFF' }} />
            ) : (
              <>
                <CloudUploadIcon sx={{ fontSize: 48, color: 'rgba(255,255,255,0.4)', mb: 1 }} />
                <Typography sx={{ color: 'rgba(255,255,255,0.6)' }}>
                  Click to upload sidebar image
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
          label="Image Alt Text"
          value={sidebar.imageAlt || ''}
          onChange={(e) => updateSidebar('imageAlt', e.target.value)}
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
        aspectRatio={1}
        outputWidth={800}
        outputHeight={800}
      />

      <Grid item xs={12}>
        <CustomTextField
          label="Sidebar Title"
          value={sidebar.title || ''}
          onChange={(e) => updateSidebar('title', e.target.value)}
          fullWidth
          placeholder="e.g. Program Highlights"
        />
      </Grid>

      <Grid item xs={12}>
        <Typography variant="subtitle2" sx={{ mb: 1, color: 'rgba(255,255,255,0.7)' }}>
          Bullet Points
        </Typography>
      </Grid>

      {bullets.map((bullet, idx) => {
        const isDragging = draggedBulletIndex === idx;
        const isDragOver = dragOverBulletIndex === idx;

        return (
          <Grid item xs={12} key={idx}>
            <Box
              draggable
              onDragStart={() => handleBulletDragStart(idx)}
              onDragOver={(e) => handleBulletDragOver(e, idx)}
              onDragEnd={handleBulletDragEnd}
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                p: 1.5,
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
                label={`Bullet ${idx + 1}`}
                value={bullet}
                onChange={(e) => updateBullet(idx, e.target.value)}
                fullWidth
                size="small"
              />
              <IconButton
                onClick={() => removeBullet(idx)}
                sx={{ color: 'rgba(255,255,255,0.5)' }}
                disabled={bullets.length <= 1}
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
          onClick={addBullet}
          variant="outlined"
          size="small"
          sx={{ borderColor: 'rgba(255,255,255,0.3)', color: 'rgba(255,255,255,0.9)' }}
        >
          Add Bullet
        </Button>
      </Grid>

      {/* ─────────────────────────────────────────────────────────────────────── */}
      {/* KEY TAKEAWAY */}
      {/* ─────────────────────────────────────────────────────────────────────── */}
      <Grid item xs={12}>
        <Divider sx={{ my: 2, bgcolor: 'rgba(255,255,255,0.1)' }} />
        <Typography variant="h6" sx={{ mb: 2, color: 'rgba(255,255,255,0.9)' }}>
          Key Takeaway
        </Typography>
      </Grid>

      <Grid item xs={12}>
        <CustomTextField
          label="Key Takeaway Text"
          value={keyTakeaway.text || ''}
          onChange={(e) => updateKeyTakeaway(e.target.value)}
          fullWidth
          multiline
          rows={2}
          placeholder="e.g. 92% of participants reported increased confidence..."
          helperText="This is displayed prominently at the bottom of the sidebar"
        />
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
          value={flexB.ariaLabel || ''}
          onChange={(e) => onFlexBChange('ariaLabel', e.target.value)}
          fullWidth
          placeholder="e.g. Case study section"
        />
      </Grid>
    </Grid>
  );
}

export default FlexBTabEditor;

