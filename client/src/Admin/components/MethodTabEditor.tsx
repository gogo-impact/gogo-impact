import React, { useState } from 'react';
import {
  Grid,
  Box,
  Typography,
  Button,
  Divider,
  IconButton,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import ColorPickerPopover from '../../components/ColorPickerPopover';
import { IconSelector } from '../../components/IconSelector';
import { CustomTextField } from '../styles';
import { GradientEditor, parseGradientString, composeGradient } from './GradientEditor';
import { MethodContent, MethodItem } from '../../services/impact.api';
import COLORS from '../../../assets/colors';

export interface MethodTabEditorProps {
  method: MethodContent;
  defaultSwatch: string[] | null;
  onMethodChange: (field: keyof MethodContent, value: any) => void;
}

type MethodColorPickerField =
  | 'subtitleColor'
  | 'cardBgColor'
  | 'cardBorderColor'
  | 'cardTitleColor'
  | 'leadTextColor'
  | 'secondaryTextColor'
  | 'secondaryBorderColor'
  | 'glowColor1'
  | 'glowColor2';

// Default method items
const DEFAULT_METHOD_ITEMS: MethodItem[] = [
  { id: '1', iconKey: 'handshakeOutlined', text: 'Trusting relationships with caring adults' },
  { id: '2', iconKey: 'menuBook', text: 'High-quality, no-cost arts education during typically unsupervised hours' },
  { id: '3', iconKey: 'lightbulb', text: 'Enriching, safe activities that foster self-esteem & creative self-expression' },
  { id: '4', iconKey: 'tuneOutlined', text: 'Skill Development' },
  { id: '5', iconKey: 'mic', text: 'Performance' },
  { id: '6', iconKey: 'favoriteBorder', text: 'Trauma-informed mental health support' },
];

export function MethodTabEditor({
  method,
  defaultSwatch,
  onMethodChange,
}: MethodTabEditorProps) {
  const [colorPickerAnchor, setColorPickerAnchor] = useState<HTMLElement | null>(null);
  const [colorPickerField, setColorPickerField] = useState<MethodColorPickerField | null>(null);

  // State for gradient color picker
  const [gradientPickerAnchor, setGradientPickerAnchor] = useState<HTMLElement | null>(null);
  const [gradientPickerKey, setGradientPickerKey] = useState<'titleGradient' | 'sectionBgGradient' | 'iconGradient' | null>(null);
  const [gradientPickerColorIndex, setGradientPickerColorIndex] = useState<number>(0);
  const gradientPickerOpen = Boolean(gradientPickerAnchor);

  // Get default gradients
  const getDefaultGradient = (key: 'titleGradient' | 'sectionBgGradient' | 'iconGradient'): string => {
    switch (key) {
      case 'titleGradient':
        return method.titleGradient || `linear-gradient(90deg, ${COLORS.gogo_blue}, ${COLORS.gogo_teal})`;
      case 'sectionBgGradient':
        return method.sectionBgGradient || 'linear-gradient(180deg, #111111 0%, #0a0a0a 100%)';
      case 'iconGradient':
        return method.iconGradient || `linear-gradient(135deg, ${COLORS.gogo_blue}, ${COLORS.gogo_teal})`;
      default:
        return `linear-gradient(90deg, ${COLORS.gogo_blue}, ${COLORS.gogo_teal})`;
    }
  };

  // Get current gradient color for the picker
  const getGradientPickerColor = (): string => {
    if (!gradientPickerKey) return '#000000';
    const gradient = getDefaultGradient(gradientPickerKey);
    const parsed = parseGradientString(gradient);
    return parsed.colors[gradientPickerColorIndex] || '#000000';
  };

  const openGradientPicker = (el: HTMLElement, key: 'titleGradient' | 'sectionBgGradient' | 'iconGradient', colorIndex: number) => {
    setGradientPickerKey(key);
    setGradientPickerColorIndex(colorIndex);
    setGradientPickerAnchor(el);
  };

  const handleGradientColorChange = (color: string) => {
    if (!gradientPickerKey) return;
    const currentGradient = getDefaultGradient(gradientPickerKey);
    const parsed = parseGradientString(currentGradient);
    const newColors = [...parsed.colors];
    newColors[gradientPickerColorIndex] = color;
    const newGradient = composeGradient(parsed.type, parsed.degree, newColors);
    onMethodChange(gradientPickerKey, newGradient);
  };

  const closeGradientPicker = () => {
    setGradientPickerAnchor(null);
    setGradientPickerKey(null);
  };

  // Color picker helpers
  const openColorPicker = (el: HTMLElement, field: MethodColorPickerField) => {
    setColorPickerField(field);
    setColorPickerAnchor(el);
  };

  const handleColorChange = (color: string) => {
    if (colorPickerField) {
      onMethodChange(colorPickerField, color);
    }
  };

  const closeColorPicker = () => {
    setColorPickerAnchor(null);
    setColorPickerField(null);
  };

  const getColorValue = (field: MethodColorPickerField): string => {
    switch (field) {
      case 'subtitleColor':
        return method.subtitleColor ?? 'rgba(255, 255, 255, 0.8)';
      case 'cardBgColor':
        return method.cardBgColor ?? 'rgba(255, 255, 255, 0.02)';
      case 'cardBorderColor':
        return method.cardBorderColor ?? 'rgba(255, 255, 255, 0.05)';
      case 'cardTitleColor':
        return method.cardTitleColor ?? '#ffffff';
      case 'leadTextColor':
        return method.leadTextColor ?? '#ffffff';
      case 'secondaryTextColor':
        return method.secondaryTextColor ?? 'rgba(255, 255, 255, 0.6)';
      case 'secondaryBorderColor':
        return method.secondaryBorderColor ?? COLORS.gogo_purple;
      case 'glowColor1':
        return method.glowColor1 ?? COLORS.gogo_blue;
      case 'glowColor2':
        return method.glowColor2 ?? COLORS.gogo_teal;
      default:
        return '#ffffff';
    }
  };

  // Method items helpers
  const methodItems: MethodItem[] = method.methodItems ?? DEFAULT_METHOD_ITEMS;

  const addMethodItem = () => {
    const newItem: MethodItem = {
      id: `method-${Date.now()}`,
      iconKey: 'star',
      text: 'New method item',
    };
    onMethodChange('methodItems', [...methodItems, newItem]);
  };

  const updateMethodItem = (index: number, field: keyof MethodItem, value: string) => {
    const updated = [...methodItems];
    updated[index] = { ...updated[index], [field]: value };
    onMethodChange('methodItems', updated);
  };

  const removeMethodItem = (index: number) => {
    const updated = methodItems.filter((_, i) => i !== index);
    onMethodChange('methodItems', updated);
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
          value={getDefaultGradient('sectionBgGradient')}
          onChange={(gradient) => onMethodChange('sectionBgGradient', gradient)}
          showTypeSelector
          showThreeColorToggle
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
            <span style={{ display: 'inline-block', width: 16, height: 16, borderRadius: 3, background: method.glowColor1 ?? COLORS.gogo_blue, border: '1px solid rgba(255,255,255,0.2)' }} />
            &nbsp;Left glow color
          </Button>
          <Button
            size="small"
            variant="outlined"
            onClick={(e) => openColorPicker(e.currentTarget, 'glowColor2')}
            sx={{ borderColor: 'rgba(255,255,255,0.3)', color: 'rgba(255,255,255,0.9)' }}
          >
            <span style={{ display: 'inline-block', width: 16, height: 16, borderRadius: 3, background: method.glowColor2 ?? COLORS.gogo_teal, border: '1px solid rgba(255,255,255,0.2)' }} />
            &nbsp;Right glow color
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

      <Grid item xs={12} md={6}>
        <CustomTextField
          label="Title"
          value={method.title ?? 'Our Method'}
          onChange={(e) => onMethodChange('title', e.target.value)}
          fullWidth
        />
      </Grid>

      <Grid item xs={12}>
        <GradientEditor
          label="Title Gradient"
          value={getDefaultGradient('titleGradient')}
          onChange={(gradient) => onMethodChange('titleGradient', gradient)}
          showTypeSelector
          showThreeColorToggle
        />
      </Grid>

      <Grid item xs={12}>
        <CustomTextField
          label="Subtitle"
          value={method.subtitle ?? 'Our mentoring-centric approach is delivered by paid, professional musician mentors and helps alleviate primary challenges faced by youth in vulnerable communities by providing:'}
          onChange={(e) => onMethodChange('subtitle', e.target.value)}
          fullWidth
          multiline
          rows={3}
        />
      </Grid>

      <Grid item xs={12}>
        <Button
          size="small"
          variant="outlined"
          onClick={(e) => openColorPicker(e.currentTarget, 'subtitleColor')}
          sx={{ borderColor: 'rgba(255,255,255,0.3)', color: 'rgba(255,255,255,0.9)' }}
        >
          <span style={{ display: 'inline-block', width: 16, height: 16, borderRadius: 3, background: method.subtitleColor ?? 'rgba(255, 255, 255, 0.8)', border: '1px solid rgba(255,255,255,0.2)' }} />
          &nbsp;Subtitle color
        </Button>
      </Grid>

      {/* ─────────────────────────────────────────────────────────────────────── */}
      {/* METHOD CARDS */}
      {/* ─────────────────────────────────────────────────────────────────────── */}
      <Grid item xs={12}>
        <Divider sx={{ my: 2, bgcolor: 'rgba(255,255,255,0.1)' }} />
        <Typography variant="h6" sx={{ mb: 2, color: 'rgba(255,255,255,0.9)' }}>
          Method Cards
        </Typography>
      </Grid>

      <Grid item xs={12}>
        <GradientEditor
          label="Icon Background Gradient"
          value={getDefaultGradient('iconGradient')}
          onChange={(gradient) => onMethodChange('iconGradient', gradient)}
          showTypeSelector
          showThreeColorToggle
        />
      </Grid>

      <Grid item xs={12}>
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <Button
            size="small"
            variant="outlined"
            onClick={(e) => openColorPicker(e.currentTarget, 'cardBgColor')}
            sx={{ borderColor: 'rgba(255,255,255,0.3)', color: 'rgba(255,255,255,0.9)' }}
          >
            <span style={{ display: 'inline-block', width: 16, height: 16, borderRadius: 3, background: method.cardBgColor ?? 'rgba(255, 255, 255, 0.02)', border: '1px solid rgba(255,255,255,0.2)' }} />
            &nbsp;Card background
          </Button>
          <Button
            size="small"
            variant="outlined"
            onClick={(e) => openColorPicker(e.currentTarget, 'cardBorderColor')}
            sx={{ borderColor: 'rgba(255,255,255,0.3)', color: 'rgba(255,255,255,0.9)' }}
          >
            <span style={{ display: 'inline-block', width: 16, height: 16, borderRadius: 3, background: method.cardBorderColor ?? 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255,255,255,0.2)' }} />
            &nbsp;Card border
          </Button>
          <Button
            size="small"
            variant="outlined"
            onClick={(e) => openColorPicker(e.currentTarget, 'cardTitleColor')}
            sx={{ borderColor: 'rgba(255,255,255,0.3)', color: 'rgba(255,255,255,0.9)' }}
          >
            <span style={{ display: 'inline-block', width: 16, height: 16, borderRadius: 3, background: method.cardTitleColor ?? '#ffffff', border: '1px solid rgba(255,255,255,0.2)' }} />
            &nbsp;Card text color
          </Button>
        </Box>
      </Grid>

      {/* Method Items */}
      <Grid item xs={12}>
        <Typography variant="subtitle2" sx={{ mb: 1, color: 'rgba(255,255,255,0.7)' }}>
          Method Items
        </Typography>
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
            {/* First row: Icon selector + delete button */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Box sx={{ width: 200 }}>
                <IconSelector
                  label="Icon"
                  value={item.iconKey ?? ''}
                  onChange={(key) => updateMethodItem(idx, 'iconKey', key)}
                  allowNone={false}
                />
              </Box>
              <Box sx={{ flex: 1 }} />
              <IconButton
                onClick={() => removeMethodItem(idx)}
                sx={{ color: 'rgba(255,255,255,0.5)' }}
                disabled={methodItems.length <= 1}
              >
                <DeleteIcon />
              </IconButton>
            </Box>
            {/* Second row: Text field */}
            <CustomTextField
              label="Text"
              value={item.text}
              onChange={(e) => updateMethodItem(idx, 'text', e.target.value)}
              fullWidth
              multiline
              rows={2}
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

      {/* ─────────────────────────────────────────────────────────────────────── */}
      {/* NARRATIVE SECTION */}
      {/* ─────────────────────────────────────────────────────────────────────── */}
      <Grid item xs={12}>
        <Divider sx={{ my: 2, bgcolor: 'rgba(255,255,255,0.1)' }} />
        <Typography variant="h6" sx={{ mb: 2, color: 'rgba(255,255,255,0.9)' }}>
          Narrative Section
        </Typography>
      </Grid>

      <Grid item xs={12}>
        <CustomTextField
          label="Lead Text"
          value={method.leadText ?? 'Our successful model pairs youth with a caring adult mentor, the unparalleled power of music, and trauma-informed mental health support.'}
          onChange={(e) => onMethodChange('leadText', e.target.value)}
          fullWidth
          multiline
          rows={3}
        />
      </Grid>

      <Grid item xs={12}>
        <Button
          size="small"
          variant="outlined"
          onClick={(e) => openColorPicker(e.currentTarget, 'leadTextColor')}
          sx={{ borderColor: 'rgba(255,255,255,0.3)', color: 'rgba(255,255,255,0.9)' }}
        >
          <span style={{ display: 'inline-block', width: 16, height: 16, borderRadius: 3, background: method.leadTextColor ?? '#ffffff', border: '1px solid rgba(255,255,255,0.2)' }} />
          &nbsp;Lead text color
        </Button>
      </Grid>

      <Grid item xs={12}>
        <CustomTextField
          label="Secondary Text"
          value={method.secondaryText ?? 'Separately, these interventions increase academic and social-emotional development as well as future employability and economic potential. We uniquely combine these to maximize their collective effectiveness. Through weekly after-school music and art instruction, mentoring, trauma-informed care, and performance opportunities across Miami, Chicago, Los Angeles, and New York, GOGO is a platform for youth to learn, grow and unleash their leadership potential.'}
          onChange={(e) => onMethodChange('secondaryText', e.target.value)}
          fullWidth
          multiline
          rows={4}
        />
      </Grid>

      <Grid item xs={12}>
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <Button
            size="small"
            variant="outlined"
            onClick={(e) => openColorPicker(e.currentTarget, 'secondaryTextColor')}
            sx={{ borderColor: 'rgba(255,255,255,0.3)', color: 'rgba(255,255,255,0.9)' }}
          >
            <span style={{ display: 'inline-block', width: 16, height: 16, borderRadius: 3, background: method.secondaryTextColor ?? 'rgba(255, 255, 255, 0.6)', border: '1px solid rgba(255,255,255,0.2)' }} />
            &nbsp;Secondary text color
          </Button>
          <Button
            size="small"
            variant="outlined"
            onClick={(e) => openColorPicker(e.currentTarget, 'secondaryBorderColor')}
            sx={{ borderColor: 'rgba(255,255,255,0.3)', color: 'rgba(255,255,255,0.9)' }}
          >
            <span style={{ display: 'inline-block', width: 16, height: 16, borderRadius: 3, background: method.secondaryBorderColor ?? COLORS.gogo_purple, border: '1px solid rgba(255,255,255,0.2)' }} />
            &nbsp;Secondary border color
          </Button>
        </Box>
      </Grid>
    </Grid>
  );
}

export default MethodTabEditor;

