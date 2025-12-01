import React, { useState, useRef } from 'react';
import {
  Grid,
  Box,
  Typography,
  Button,
  Divider,
  CircularProgress,
} from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import DeleteIcon from '@mui/icons-material/Delete';
import ColorPickerPopover from '../../components/ColorPickerPopover';
import { CustomTextField } from '../styles';
import { GradientEditor, parseGradientString, composeGradient } from './GradientEditor';
import { TestimonialsContent } from '../../services/impact.api';
import { uploadFile } from '../../services/upload.api';

export interface TestimonialsTabEditorProps {
  testimonials: TestimonialsContent;
  defaultSwatch: string[] | null;
  onTestimonialsChange: (field: keyof TestimonialsContent, value: unknown) => void;
}

type TestimonialsColorField =
  | 'glowColor1'
  | 'glowColor2'
  | 'eyebrowColor'
  | 'eqBorderColor'
  | 'imageBorderColor'
  | 'quoteCardBorderColor'
  | 'quoteTextColor'
  | 'quoteMarkColor'
  | 'attributionColor'
  | 'attributionIconColor';

type GradientField =
  | 'sectionBgGradient'
  | 'nameGradient'
  | 'eqBarGradient'
  | 'eqBgGradient'
  | 'quoteCardBgGradient';

export function TestimonialsTabEditor({
  testimonials,
  defaultSwatch,
  onTestimonialsChange,
}: TestimonialsTabEditorProps) {
  const [colorPickerAnchor, setColorPickerAnchor] = useState<HTMLElement | null>(null);
  const [colorPickerField, setColorPickerField] = useState<TestimonialsColorField | null>(null);

  // Gradient picker state
  const [gradientPickerAnchor, setGradientPickerAnchor] = useState<HTMLElement | null>(null);
  const [gradientPickerKey, setGradientPickerKey] = useState<GradientField | null>(null);
  const [gradientPickerColorIndex, setGradientPickerColorIndex] = useState<number>(0);

  // Image upload state
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Color picker helpers
  const openColorPicker = (el: HTMLElement, field: TestimonialsColorField) => {
    setColorPickerField(field);
    setColorPickerAnchor(el);
  };

  const handleColorChange = (color: string) => {
    if (colorPickerField) {
      onTestimonialsChange(colorPickerField, color);
    }
  };

  const closeColorPicker = () => {
    setColorPickerAnchor(null);
    setColorPickerField(null);
  };

  const getColorValue = (field: TestimonialsColorField): string => {
    return (testimonials[field] as string) || '';
  };

  // Gradient helpers
  const getGradientValue = (key: GradientField): string => {
    return (testimonials[key] as string) || '';
  };

  const openGradientPicker = (el: HTMLElement, key: GradientField, colorIndex: number) => {
    setGradientPickerKey(key);
    setGradientPickerColorIndex(colorIndex);
    setGradientPickerAnchor(el);
  };

  const getGradientPickerColor = (): string => {
    if (!gradientPickerKey) return '#000000';
    const gradient = getGradientValue(gradientPickerKey);
    if (!gradient) return '#000000';
    const parsed = parseGradientString(gradient);
    return parsed.colors[gradientPickerColorIndex] || '#000000';
  };

  const handleGradientColorChange = (color: string) => {
    if (!gradientPickerKey) return;
    const currentGradient = getGradientValue(gradientPickerKey);
    if (!currentGradient) {
      const newGradient = `linear-gradient(90deg, ${color}, ${color})`;
      onTestimonialsChange(gradientPickerKey, newGradient);
      return;
    }
    const parsed = parseGradientString(currentGradient);
    const newColors = [...parsed.colors];
    newColors[gradientPickerColorIndex] = color;
    const newGradient = composeGradient(parsed.type, parsed.degree, newColors, parsed.opacity);
    onTestimonialsChange(gradientPickerKey, newGradient);
  };

  const closeGradientPicker = () => {
    setGradientPickerAnchor(null);
    setGradientPickerKey(null);
  };

  // Image upload handler
  const handleImageUpload = async (file: File) => {
    setUploading(true);
    try {
      const result = await uploadFile(file, { folder: 'testimonials' });
      onTestimonialsChange('imageUrl', result.publicUrl);
    } catch (error) {
      console.error('Failed to upload image:', error);
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveImage = () => {
    onTestimonialsChange('imageUrl', null);
  };

  return (
    <Grid container spacing={3}>
      {/* Color Picker Popover */}
      <ColorPickerPopover
        open={Boolean(colorPickerAnchor)}
        anchorEl={colorPickerAnchor}
        color={colorPickerField ? getColorValue(colorPickerField) : ''}
        onChange={handleColorChange}
        onClose={closeColorPicker}
        swatches={defaultSwatch ?? undefined}
      />

      {/* Gradient Color Picker Popover */}
      <ColorPickerPopover
        open={Boolean(gradientPickerAnchor)}
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
          onChange={(gradient) => onTestimonialsChange('sectionBgGradient', gradient)}
          onColorClick={(el, idx) => openGradientPicker(el, 'sectionBgGradient', idx)}
        />
      </Grid>

      <Grid item xs={12}>
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <Button
            size="small"
            variant="outlined"
            onClick={(e) => openColorPicker(e.currentTarget, 'glowColor1')}
            sx={{ borderColor: 'rgba(255,255,255,0.3)', color: 'rgba(255,255,255,0.9)' }}
          >
            <span style={{ display: 'inline-block', width: 16, height: 16, borderRadius: 3, background: testimonials.glowColor1 || 'transparent', border: '1px solid rgba(255,255,255,0.2)' }} />
            &nbsp;Glow color 1
          </Button>
          <Button
            size="small"
            variant="outlined"
            onClick={(e) => openColorPicker(e.currentTarget, 'glowColor2')}
            sx={{ borderColor: 'rgba(255,255,255,0.3)', color: 'rgba(255,255,255,0.9)' }}
          >
            <span style={{ display: 'inline-block', width: 16, height: 16, borderRadius: 3, background: testimonials.glowColor2 || 'transparent', border: '1px solid rgba(255,255,255,0.2)' }} />
            &nbsp;Glow color 2
          </Button>
        </Box>
      </Grid>

      {/* ─────────────────────────────────────────────────────────────────────── */}
      {/* EYEBROW */}
      {/* ─────────────────────────────────────────────────────────────────────── */}
      <Grid item xs={12}>
        <Divider sx={{ my: 2, bgcolor: 'rgba(255,255,255,0.1)' }} />
        <Typography variant="h6" sx={{ mb: 2, color: 'rgba(255,255,255,0.9)' }}>
          Eyebrow
        </Typography>
      </Grid>

      <Grid item xs={12} md={6}>
        <CustomTextField
          label="Eyebrow Text"
          value={testimonials.eyebrowText || ''}
          onChange={(e) => onTestimonialsChange('eyebrowText', e.target.value)}
          fullWidth
          placeholder="e.g., Testimonial"
        />
      </Grid>

      <Grid item xs={12} md={6}>
        <Button
          size="small"
          variant="outlined"
          onClick={(e) => openColorPicker(e.currentTarget, 'eyebrowColor')}
          sx={{ borderColor: 'rgba(255,255,255,0.3)', color: 'rgba(255,255,255,0.9)', mt: 1 }}
        >
          <span style={{ display: 'inline-block', width: 16, height: 16, borderRadius: 3, background: testimonials.eyebrowColor || 'transparent', border: '1px solid rgba(255,255,255,0.2)' }} />
          &nbsp;Eyebrow color
        </Button>
      </Grid>

      {/* ─────────────────────────────────────────────────────────────────────── */}
      {/* NAME */}
      {/* ─────────────────────────────────────────────────────────────────────── */}
      <Grid item xs={12}>
        <Divider sx={{ my: 2, bgcolor: 'rgba(255,255,255,0.1)' }} />
        <Typography variant="h6" sx={{ mb: 2, color: 'rgba(255,255,255,0.9)' }}>
          Name
        </Typography>
      </Grid>

      <Grid item xs={12} md={6}>
        <CustomTextField
          label="Name"
          value={testimonials.name || ''}
          onChange={(e) => onTestimonialsChange('name', e.target.value)}
          fullWidth
          placeholder="e.g., Jayden Holmes"
        />
      </Grid>

      <Grid item xs={12} md={6}>
        <GradientEditor
          label="Name Gradient"
          value={getGradientValue('nameGradient')}
          onChange={(gradient) => onTestimonialsChange('nameGradient', gradient)}
          onColorClick={(el, idx) => openGradientPicker(el, 'nameGradient', idx)}
        />
      </Grid>

      {/* ─────────────────────────────────────────────────────────────────────── */}
      {/* EQ BARS */}
      {/* ─────────────────────────────────────────────────────────────────────── */}
      <Grid item xs={12}>
        <Divider sx={{ my: 2, bgcolor: 'rgba(255,255,255,0.1)' }} />
        <Typography variant="h6" sx={{ mb: 2, color: 'rgba(255,255,255,0.9)' }}>
          Equalizer Bars
        </Typography>
      </Grid>

      <Grid item xs={12} md={6}>
        <GradientEditor
          label="Bar Gradient"
          value={getGradientValue('eqBarGradient')}
          onChange={(gradient) => onTestimonialsChange('eqBarGradient', gradient)}
          onColorClick={(el, idx) => openGradientPicker(el, 'eqBarGradient', idx)}
        />
      </Grid>

      <Grid item xs={12} md={6}>
        <GradientEditor
          label="EQ Background Gradient"
          value={getGradientValue('eqBgGradient')}
          onChange={(gradient) => onTestimonialsChange('eqBgGradient', gradient)}
          onColorClick={(el, idx) => openGradientPicker(el, 'eqBgGradient', idx)}
        />
      </Grid>

      <Grid item xs={12}>
        <Button
          size="small"
          variant="outlined"
          onClick={(e) => openColorPicker(e.currentTarget, 'eqBorderColor')}
          sx={{ borderColor: 'rgba(255,255,255,0.3)', color: 'rgba(255,255,255,0.9)' }}
        >
          <span style={{ display: 'inline-block', width: 16, height: 16, borderRadius: 3, background: testimonials.eqBorderColor || 'transparent', border: '1px solid rgba(255,255,255,0.2)' }} />
          &nbsp;EQ border color
        </Button>
      </Grid>

      {/* ─────────────────────────────────────────────────────────────────────── */}
      {/* IMAGE */}
      {/* ─────────────────────────────────────────────────────────────────────── */}
      <Grid item xs={12}>
        <Divider sx={{ my: 2, bgcolor: 'rgba(255,255,255,0.1)' }} />
        <Typography variant="h6" sx={{ mb: 2, color: 'rgba(255,255,255,0.9)' }}>
          Image
        </Typography>
      </Grid>

      <Grid item xs={12}>
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
          {testimonials.imageUrl ? (
            <Box sx={{ position: 'relative' }}>
              <Box
                component="img"
                src={testimonials.imageUrl}
                alt="Testimonial preview"
                sx={{
                  width: '100%',
                  maxHeight: 200,
                  objectFit: 'cover',
                  borderRadius: 2,
                }}
              />
              <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                <Button
                  size="small"
                  variant="outlined"
                  startIcon={<CloudUploadIcon />}
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  sx={{ borderColor: 'rgba(255,255,255,0.3)', color: 'rgba(255,255,255,0.9)' }}
                >
                  Replace
                </Button>
                <Button
                  size="small"
                  variant="outlined"
                  startIcon={<DeleteIcon />}
                  onClick={handleRemoveImage}
                  sx={{ borderColor: 'rgba(255,255,255,0.3)', color: 'rgba(255,255,255,0.9)' }}
                >
                  Remove
                </Button>
              </Box>
            </Box>
          ) : (
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                height: 150,
                border: '2px dashed rgba(255,255,255,0.2)',
                borderRadius: 2,
                cursor: 'pointer',
                '&:hover': { borderColor: 'rgba(255,255,255,0.4)' },
              }}
              onClick={() => fileInputRef.current?.click()}
            >
              {uploading ? (
                <CircularProgress size={24} sx={{ color: 'rgba(255,255,255,0.5)' }} />
              ) : (
                <>
                  <CloudUploadIcon sx={{ fontSize: 40, color: 'rgba(255,255,255,0.5)', mb: 1 }} />
                  <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.5)' }}>
                    Click to upload image
                  </Typography>
                </>
              )}
            </Box>
          )}
          <input
            type="file"
            accept="image/png,image/jpeg,image/webp,image/gif"
            style={{ display: 'none' }}
            ref={fileInputRef}
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleImageUpload(file);
              e.target.value = '';
            }}
          />
        </Box>
      </Grid>

      <Grid item xs={12} md={6}>
        <CustomTextField
          label="Image Alt Text"
          value={testimonials.imageAlt || ''}
          onChange={(e) => onTestimonialsChange('imageAlt', e.target.value)}
          fullWidth
          placeholder="e.g., Students performing on stage"
        />
      </Grid>

      <Grid item xs={12} md={6}>
        <Button
          size="small"
          variant="outlined"
          onClick={(e) => openColorPicker(e.currentTarget, 'imageBorderColor')}
          sx={{ borderColor: 'rgba(255,255,255,0.3)', color: 'rgba(255,255,255,0.9)', mt: 1 }}
        >
          <span style={{ display: 'inline-block', width: 16, height: 16, borderRadius: 3, background: testimonials.imageBorderColor || 'transparent', border: '1px solid rgba(255,255,255,0.2)' }} />
          &nbsp;Image border color
        </Button>
      </Grid>

      {/* ─────────────────────────────────────────────────────────────────────── */}
      {/* QUOTE CARD */}
      {/* ─────────────────────────────────────────────────────────────────────── */}
      <Grid item xs={12}>
        <Divider sx={{ my: 2, bgcolor: 'rgba(255,255,255,0.1)' }} />
        <Typography variant="h6" sx={{ mb: 2, color: 'rgba(255,255,255,0.9)' }}>
          Quote Card
        </Typography>
      </Grid>

      <Grid item xs={12}>
        <GradientEditor
          label="Quote Card Background Gradient"
          value={getGradientValue('quoteCardBgGradient')}
          onChange={(gradient) => onTestimonialsChange('quoteCardBgGradient', gradient)}
          onColorClick={(el, idx) => openGradientPicker(el, 'quoteCardBgGradient', idx)}
        />
      </Grid>

      <Grid item xs={12}>
        <Button
          size="small"
          variant="outlined"
          onClick={(e) => openColorPicker(e.currentTarget, 'quoteCardBorderColor')}
          sx={{ borderColor: 'rgba(255,255,255,0.3)', color: 'rgba(255,255,255,0.9)' }}
        >
          <span style={{ display: 'inline-block', width: 16, height: 16, borderRadius: 3, background: testimonials.quoteCardBorderColor || 'transparent', border: '1px solid rgba(255,255,255,0.2)' }} />
          &nbsp;Quote card border
        </Button>
      </Grid>

      {/* ─────────────────────────────────────────────────────────────────────── */}
      {/* QUOTE TEXT */}
      {/* ─────────────────────────────────────────────────────────────────────── */}
      <Grid item xs={12}>
        <Divider sx={{ my: 2, bgcolor: 'rgba(255,255,255,0.1)' }} />
        <Typography variant="h6" sx={{ mb: 2, color: 'rgba(255,255,255,0.9)' }}>
          Quote Text
        </Typography>
      </Grid>

      <Grid item xs={12}>
        <CustomTextField
          label="Quote Text"
          value={testimonials.quoteText || ''}
          onChange={(e) => onTestimonialsChange('quoteText', e.target.value)}
          fullWidth
          multiline
          rows={3}
          placeholder="Enter the testimonial quote..."
        />
      </Grid>

      <Grid item xs={12}>
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <Button
            size="small"
            variant="outlined"
            onClick={(e) => openColorPicker(e.currentTarget, 'quoteTextColor')}
            sx={{ borderColor: 'rgba(255,255,255,0.3)', color: 'rgba(255,255,255,0.9)' }}
          >
            <span style={{ display: 'inline-block', width: 16, height: 16, borderRadius: 3, background: testimonials.quoteTextColor || 'transparent', border: '1px solid rgba(255,255,255,0.2)' }} />
            &nbsp;Quote text color
          </Button>
          <Button
            size="small"
            variant="outlined"
            onClick={(e) => openColorPicker(e.currentTarget, 'quoteMarkColor')}
            sx={{ borderColor: 'rgba(255,255,255,0.3)', color: 'rgba(255,255,255,0.9)' }}
          >
            <span style={{ display: 'inline-block', width: 16, height: 16, borderRadius: 3, background: testimonials.quoteMarkColor || 'transparent', border: '1px solid rgba(255,255,255,0.2)' }} />
            &nbsp;Quote mark color
          </Button>
        </Box>
      </Grid>

      {/* ─────────────────────────────────────────────────────────────────────── */}
      {/* ATTRIBUTION */}
      {/* ─────────────────────────────────────────────────────────────────────── */}
      <Grid item xs={12}>
        <Divider sx={{ my: 2, bgcolor: 'rgba(255,255,255,0.1)' }} />
        <Typography variant="h6" sx={{ mb: 2, color: 'rgba(255,255,255,0.9)' }}>
          Attribution
        </Typography>
      </Grid>

      <Grid item xs={12} md={6}>
        <CustomTextField
          label="Attribution Text"
          value={testimonials.attributionText || ''}
          onChange={(e) => onTestimonialsChange('attributionText', e.target.value)}
          fullWidth
          placeholder="e.g., — 2023 Louis Salgar Award Winner"
        />
      </Grid>

      <Grid item xs={12}>
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <Button
            size="small"
            variant="outlined"
            onClick={(e) => openColorPicker(e.currentTarget, 'attributionColor')}
            sx={{ borderColor: 'rgba(255,255,255,0.3)', color: 'rgba(255,255,255,0.9)' }}
          >
            <span style={{ display: 'inline-block', width: 16, height: 16, borderRadius: 3, background: testimonials.attributionColor || 'transparent', border: '1px solid rgba(255,255,255,0.2)' }} />
            &nbsp;Attribution text color
          </Button>
          <Button
            size="small"
            variant="outlined"
            onClick={(e) => openColorPicker(e.currentTarget, 'attributionIconColor')}
            sx={{ borderColor: 'rgba(255,255,255,0.3)', color: 'rgba(255,255,255,0.9)' }}
          >
            <span style={{ display: 'inline-block', width: 16, height: 16, borderRadius: 3, background: testimonials.attributionIconColor || 'transparent', border: '1px solid rgba(255,255,255,0.2)' }} />
            &nbsp;Icon color
          </Button>
        </Box>
      </Grid>
    </Grid>
  );
}

export default TestimonialsTabEditor;

