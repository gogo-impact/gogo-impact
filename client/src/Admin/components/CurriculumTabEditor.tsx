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
import { CustomTextField } from '../styles';
import { GradientEditor, parseGradientString, composeGradient } from './GradientEditor';
import { CurriculumContent, CurriculumPedalCard, CurriculumTimelineItem } from '../../services/impact.api';

export interface CurriculumTabEditorProps {
  curriculum: CurriculumContent;
  defaultSwatch: string[] | null;
  onCurriculumChange: (field: keyof CurriculumContent, value: any) => void;
}

type CurriculumColorPickerField =
  | 'subtitleColor'
  | 'glowColor1'
  | 'glowColor2'
  | 'eqColor1'
  | 'eqColor2'
  | 'eqColor3'
  | 'pedalBgColor'
  | 'pedalBorderColor'
  | 'cardTitleColor'
  | 'cardTextColor'
  | 'timelineTitleColor'
  | 'timelineBgColor'
  | 'timelineBorderColor'
  | 'timelineItemTitleColor'
  | 'timelineItemTextColor';

// Empty placeholders (no defaults - data should come from DB)
const EMPTY_PEDAL_CARDS: CurriculumPedalCard[] = [];
const EMPTY_TIMELINE_ITEMS: CurriculumTimelineItem[] = [];

export function CurriculumTabEditor({
  curriculum,
  defaultSwatch,
  onCurriculumChange,
}: CurriculumTabEditorProps) {
  const [colorPickerAnchor, setColorPickerAnchor] = useState<HTMLElement | null>(null);
  const [colorPickerField, setColorPickerField] = useState<CurriculumColorPickerField | null>(null);
  const [pedalColorPickerIndex, setPedalColorPickerIndex] = useState<number | null>(null);

  // State for gradient color picker
  const [gradientPickerAnchor, setGradientPickerAnchor] = useState<HTMLElement | null>(null);
  const [gradientPickerKey, setGradientPickerKey] = useState<'titleGradient' | 'sectionBgGradient' | null>(null);
  const [gradientPickerColorIndex, setGradientPickerColorIndex] = useState<number>(0);
  const gradientPickerOpen = Boolean(gradientPickerAnchor);

  // Get gradient values (no defaults - data should come from DB)
  const getGradientValue = (key: 'titleGradient' | 'sectionBgGradient'): string => {
    switch (key) {
      case 'titleGradient':
        return curriculum.titleGradient || '';
      case 'sectionBgGradient':
        return curriculum.sectionBgGradient || '';
      default:
        return '';
    }
  };

  // Get current gradient color for the picker
  const getGradientPickerColor = (): string => {
    if (!gradientPickerKey) return '#000000';
    const gradient = getGradientValue(gradientPickerKey);
    if (!gradient) return '#000000';
    const parsed = parseGradientString(gradient);
    return parsed.colors[gradientPickerColorIndex] || '#000000';
  };

  const openGradientPicker = (el: HTMLElement, key: 'titleGradient' | 'sectionBgGradient', colorIndex: number) => {
    setGradientPickerKey(key);
    setGradientPickerColorIndex(colorIndex);
    setGradientPickerAnchor(el);
  };

  const handleGradientColorChange = (color: string) => {
    if (!gradientPickerKey) return;
    const currentGradient = getGradientValue(gradientPickerKey);
    if (!currentGradient) {
      // If no gradient exists yet, create a new one with the color
      const newGradient = `linear-gradient(90deg, ${color}, ${color})`;
      onCurriculumChange(gradientPickerKey, newGradient);
      return;
    }
    const parsed = parseGradientString(currentGradient);
    const newColors = [...parsed.colors];
    newColors[gradientPickerColorIndex] = color;
    const newGradient = composeGradient(parsed.type, parsed.degree, newColors, parsed.opacity);
    onCurriculumChange(gradientPickerKey, newGradient);
  };

  const closeGradientPicker = () => {
    setGradientPickerAnchor(null);
    setGradientPickerKey(null);
  };

  // Color picker helpers
  const openColorPicker = (el: HTMLElement, field: CurriculumColorPickerField) => {
    setColorPickerField(field);
    setPedalColorPickerIndex(null);
    setColorPickerAnchor(el);
  };

  const openPedalColorPicker = (el: HTMLElement, index: number) => {
    setColorPickerField(null);
    setPedalColorPickerIndex(index);
    setColorPickerAnchor(el);
  };

  const handleColorChange = (color: string) => {
    if (colorPickerField) {
      onCurriculumChange(colorPickerField, color);
    } else if (pedalColorPickerIndex !== null) {
      const cards = [...pedalCards];
      cards[pedalColorPickerIndex] = { ...cards[pedalColorPickerIndex], accentColor: color };
      onCurriculumChange('pedalCards', cards);
    }
  };

  const closeColorPicker = () => {
    setColorPickerAnchor(null);
    setColorPickerField(null);
    setPedalColorPickerIndex(null);
  };

  // Get color value (no defaults - data should come from DB)
  const getColorValue = (field: CurriculumColorPickerField): string => {
    switch (field) {
      case 'subtitleColor':
        return curriculum.subtitleColor || '';
      case 'glowColor1':
        return curriculum.glowColor1 || '';
      case 'glowColor2':
        return curriculum.glowColor2 || '';
      case 'eqColor1':
        return curriculum.eqColor1 || '';
      case 'eqColor2':
        return curriculum.eqColor2 || '';
      case 'eqColor3':
        return curriculum.eqColor3 || '';
      case 'pedalBgColor':
        return curriculum.pedalBgColor || '';
      case 'pedalBorderColor':
        return curriculum.pedalBorderColor || '';
      case 'cardTitleColor':
        return curriculum.cardTitleColor || '';
      case 'cardTextColor':
        return curriculum.cardTextColor || '';
      case 'timelineTitleColor':
        return curriculum.timelineTitleColor || '';
      case 'timelineBgColor':
        return curriculum.timelineBgColor || '';
      case 'timelineBorderColor':
        return curriculum.timelineBorderColor || '';
      case 'timelineItemTitleColor':
        return curriculum.timelineItemTitleColor || '';
      case 'timelineItemTextColor':
        return curriculum.timelineItemTextColor || '';
      default:
        return '';
    }
  };

  // Pedal cards helpers (no defaults - data should come from DB)
  const pedalCards: CurriculumPedalCard[] = curriculum.pedalCards ?? EMPTY_PEDAL_CARDS;

  const addPedalCard = () => {
    const newCard: CurriculumPedalCard = {
      id: `pedal-${Date.now()}`,
      title: '',
      text: '',
      accentColor: '',
      badges: [],
    };
    onCurriculumChange('pedalCards', [...pedalCards, newCard]);
  };

  const updatePedalCard = (index: number, field: keyof CurriculumPedalCard, value: any) => {
    const updated = [...pedalCards];
    updated[index] = { ...updated[index], [field]: value };
    onCurriculumChange('pedalCards', updated);
  };

  const removePedalCard = (index: number) => {
    const updated = pedalCards.filter((_, i) => i !== index);
    onCurriculumChange('pedalCards', updated);
  };

  // Timeline items helpers (no defaults - data should come from DB)
  const timelineItems: CurriculumTimelineItem[] = curriculum.timelineItems ?? EMPTY_TIMELINE_ITEMS;

  const addTimelineItem = () => {
    const newItem: CurriculumTimelineItem = {
      id: `timeline-${Date.now()}`,
      title: '',
      text: '',
    };
    onCurriculumChange('timelineItems', [...timelineItems, newItem]);
  };

  const updateTimelineItem = (index: number, field: keyof CurriculumTimelineItem, value: string) => {
    const updated = [...timelineItems];
    updated[index] = { ...updated[index], [field]: value };
    onCurriculumChange('timelineItems', updated);
  };

  const removeTimelineItem = (index: number) => {
    const updated = timelineItems.filter((_, i) => i !== index);
    onCurriculumChange('timelineItems', updated);
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
            : pedalColorPickerIndex !== null
            ? pedalCards[pedalColorPickerIndex]?.accentColor || ''
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
          onChange={(gradient) => onCurriculumChange('sectionBgGradient', gradient)}
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
            <span style={{ display: 'inline-block', width: 16, height: 16, borderRadius: 3, background: curriculum.glowColor1 || 'transparent', border: '1px solid rgba(255,255,255,0.2)' }} />
            &nbsp;Left glow color
          </Button>
          <Button
            size="small"
            variant="outlined"
            onClick={(e) => openColorPicker(e.currentTarget, 'glowColor2')}
            sx={{ borderColor: 'rgba(255,255,255,0.3)', color: 'rgba(255,255,255,0.9)' }}
          >
            <span style={{ display: 'inline-block', width: 16, height: 16, borderRadius: 3, background: curriculum.glowColor2 || 'transparent', border: '1px solid rgba(255,255,255,0.2)' }} />
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
          value={curriculum.title || ''}
          onChange={(e) => onCurriculumChange('title', e.target.value)}
          fullWidth
          placeholder="Enter title..."
        />
      </Grid>

      <Grid item xs={12}>
        <GradientEditor
          label="Title Gradient"
          value={getGradientValue('titleGradient')}
          onChange={(gradient) => onCurriculumChange('titleGradient', gradient)}
          showTypeSelector
          showThreeColorToggle
        />
      </Grid>

      <Grid item xs={12}>
        <CustomTextField
          label="Subtitle"
          value={curriculum.subtitle || ''}
          onChange={(e) => onCurriculumChange('subtitle', e.target.value)}
          fullWidth
          multiline
          rows={3}
          placeholder="Enter subtitle..."
        />
      </Grid>

      <Grid item xs={12}>
        <Button
          size="small"
          variant="outlined"
          onClick={(e) => openColorPicker(e.currentTarget, 'subtitleColor')}
          sx={{ borderColor: 'rgba(255,255,255,0.3)', color: 'rgba(255,255,255,0.9)' }}
        >
          <span style={{ display: 'inline-block', width: 16, height: 16, borderRadius: 3, background: curriculum.subtitleColor || 'transparent', border: '1px solid rgba(255,255,255,0.2)' }} />
          &nbsp;Subtitle color
        </Button>
      </Grid>

      {/* Equalizer Colors */}
      <Grid item xs={12}>
        <Typography variant="subtitle2" sx={{ mb: 1, color: 'rgba(255,255,255,0.7)' }}>
          Equalizer Bar Colors (3 alternating)
        </Typography>
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <Button
            size="small"
            variant="outlined"
            onClick={(e) => openColorPicker(e.currentTarget, 'eqColor1')}
            sx={{ borderColor: 'rgba(255,255,255,0.3)', color: 'rgba(255,255,255,0.9)' }}
          >
            <span style={{ display: 'inline-block', width: 16, height: 16, borderRadius: 3, background: curriculum.eqColor1 || 'transparent', border: '1px solid rgba(255,255,255,0.2)' }} />
            &nbsp;EQ Color 1
          </Button>
          <Button
            size="small"
            variant="outlined"
            onClick={(e) => openColorPicker(e.currentTarget, 'eqColor2')}
            sx={{ borderColor: 'rgba(255,255,255,0.3)', color: 'rgba(255,255,255,0.9)' }}
          >
            <span style={{ display: 'inline-block', width: 16, height: 16, borderRadius: 3, background: curriculum.eqColor2 || 'transparent', border: '1px solid rgba(255,255,255,0.2)' }} />
            &nbsp;EQ Color 2
          </Button>
          <Button
            size="small"
            variant="outlined"
            onClick={(e) => openColorPicker(e.currentTarget, 'eqColor3')}
            sx={{ borderColor: 'rgba(255,255,255,0.3)', color: 'rgba(255,255,255,0.9)' }}
          >
            <span style={{ display: 'inline-block', width: 16, height: 16, borderRadius: 3, background: curriculum.eqColor3 || 'transparent', border: '1px solid rgba(255,255,255,0.2)' }} />
            &nbsp;EQ Color 3
          </Button>
        </Box>
      </Grid>

      {/* ─────────────────────────────────────────────────────────────────────── */}
      {/* PEDAL CARDS */}
      {/* ─────────────────────────────────────────────────────────────────────── */}
      <Grid item xs={12}>
        <Divider sx={{ my: 2, bgcolor: 'rgba(255,255,255,0.1)' }} />
        <Typography variant="h6" sx={{ mb: 2, color: 'rgba(255,255,255,0.9)' }}>
          Program Cards (Pedals)
        </Typography>
      </Grid>

      <Grid item xs={12}>
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mb: 2 }}>
          <Button
            size="small"
            variant="outlined"
            onClick={(e) => openColorPicker(e.currentTarget, 'pedalBgColor')}
            sx={{ borderColor: 'rgba(255,255,255,0.3)', color: 'rgba(255,255,255,0.9)' }}
          >
            <span style={{ display: 'inline-block', width: 16, height: 16, borderRadius: 3, background: curriculum.pedalBgColor || 'transparent', border: '1px solid rgba(255,255,255,0.2)' }} />
            &nbsp;Card background
          </Button>
          <Button
            size="small"
            variant="outlined"
            onClick={(e) => openColorPicker(e.currentTarget, 'cardTitleColor')}
            sx={{ borderColor: 'rgba(255,255,255,0.3)', color: 'rgba(255,255,255,0.9)' }}
          >
            <span style={{ display: 'inline-block', width: 16, height: 16, borderRadius: 3, background: curriculum.cardTitleColor || 'transparent', border: '1px solid rgba(255,255,255,0.2)' }} />
            &nbsp;Card title color
          </Button>
          <Button
            size="small"
            variant="outlined"
            onClick={(e) => openColorPicker(e.currentTarget, 'cardTextColor')}
            sx={{ borderColor: 'rgba(255,255,255,0.3)', color: 'rgba(255,255,255,0.9)' }}
          >
            <span style={{ display: 'inline-block', width: 16, height: 16, borderRadius: 3, background: curriculum.cardTextColor || 'transparent', border: '1px solid rgba(255,255,255,0.2)' }} />
            &nbsp;Card text color
          </Button>
        </Box>
      </Grid>

      {/* Pedal Cards List */}
      {pedalCards.map((card, idx) => (
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
            {/* First row: Title + accent color + delete */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <CustomTextField
                label="Card Title"
                value={card.title}
                onChange={(e) => updatePedalCard(idx, 'title', e.target.value)}
                sx={{ flex: 1 }}
                placeholder="Enter card title..."
              />
              <Button
                size="small"
                variant="outlined"
                onClick={(e) => openPedalColorPicker(e.currentTarget, idx)}
                sx={{ borderColor: 'rgba(255,255,255,0.3)', color: 'rgba(255,255,255,0.9)', minWidth: 120 }}
              >
                <span style={{ display: 'inline-block', width: 16, height: 16, borderRadius: 3, background: card.accentColor || 'transparent', border: '1px solid rgba(255,255,255,0.2)' }} />
                &nbsp;Accent
              </Button>
              <IconButton
                onClick={() => removePedalCard(idx)}
                sx={{ color: 'rgba(255,255,255,0.5)' }}
                disabled={pedalCards.length <= 1}
              >
                <DeleteIcon />
              </IconButton>
            </Box>
            {/* Second row: Text */}
            <CustomTextField
              label="Card Text"
              value={card.text}
              onChange={(e) => updatePedalCard(idx, 'text', e.target.value)}
              fullWidth
              multiline
              rows={2}
              placeholder="Enter card description..."
            />
            {/* Third row: Badges (comma-separated) */}
            <CustomTextField
              label="Badges (comma-separated)"
              value={card.badges.join(', ')}
              onChange={(e) => {
                const badges = e.target.value.split(',').map((b) => b.trim()).filter(Boolean);
                updatePedalCard(idx, 'badges', badges);
              }}
              fullWidth
              placeholder="Badge 1, Badge 2, Badge 3..."
            />
          </Box>
        </Grid>
      ))}

      <Grid item xs={12}>
        <Button
          startIcon={<AddIcon />}
          onClick={addPedalCard}
          variant="outlined"
          sx={{ borderColor: 'rgba(255,255,255,0.3)', color: 'rgba(255,255,255,0.9)' }}
        >
          Add Program Card
        </Button>
      </Grid>

      {/* ─────────────────────────────────────────────────────────────────────── */}
      {/* TIMELINE / SIGNAL FLOW */}
      {/* ─────────────────────────────────────────────────────────────────────── */}
      <Grid item xs={12}>
        <Divider sx={{ my: 2, bgcolor: 'rgba(255,255,255,0.1)' }} />
        <Typography variant="h6" sx={{ mb: 2, color: 'rgba(255,255,255,0.9)' }}>
          Signal Flow (Timeline)
        </Typography>
      </Grid>

      <Grid item xs={12} md={6}>
        <CustomTextField
          label="Timeline Section Title"
          value={curriculum.timelineTitle || ''}
          onChange={(e) => onCurriculumChange('timelineTitle', e.target.value)}
          fullWidth
          placeholder="e.g., Signal Flow"
        />
      </Grid>

      <Grid item xs={12}>
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mb: 2 }}>
          <Button
            size="small"
            variant="outlined"
            onClick={(e) => openColorPicker(e.currentTarget, 'timelineTitleColor')}
            sx={{ borderColor: 'rgba(255,255,255,0.3)', color: 'rgba(255,255,255,0.9)' }}
          >
            <span style={{ display: 'inline-block', width: 16, height: 16, borderRadius: 3, background: curriculum.timelineTitleColor || 'transparent', border: '1px solid rgba(255,255,255,0.2)' }} />
            &nbsp;Title color
          </Button>
          <Button
            size="small"
            variant="outlined"
            onClick={(e) => openColorPicker(e.currentTarget, 'timelineBgColor')}
            sx={{ borderColor: 'rgba(255,255,255,0.3)', color: 'rgba(255,255,255,0.9)' }}
          >
            <span style={{ display: 'inline-block', width: 16, height: 16, borderRadius: 3, background: curriculum.timelineBgColor || 'transparent', border: '1px solid rgba(255,255,255,0.2)' }} />
            &nbsp;Background
          </Button>
          <Button
            size="small"
            variant="outlined"
            onClick={(e) => openColorPicker(e.currentTarget, 'timelineBorderColor')}
            sx={{ borderColor: 'rgba(255,255,255,0.3)', color: 'rgba(255,255,255,0.9)' }}
          >
            <span style={{ display: 'inline-block', width: 16, height: 16, borderRadius: 3, background: curriculum.timelineBorderColor || 'transparent', border: '1px solid rgba(255,255,255,0.2)' }} />
            &nbsp;Border
          </Button>
          <Button
            size="small"
            variant="outlined"
            onClick={(e) => openColorPicker(e.currentTarget, 'timelineItemTitleColor')}
            sx={{ borderColor: 'rgba(255,255,255,0.3)', color: 'rgba(255,255,255,0.9)' }}
          >
            <span style={{ display: 'inline-block', width: 16, height: 16, borderRadius: 3, background: curriculum.timelineItemTitleColor || 'transparent', border: '1px solid rgba(255,255,255,0.2)' }} />
            &nbsp;Item title color
          </Button>
          <Button
            size="small"
            variant="outlined"
            onClick={(e) => openColorPicker(e.currentTarget, 'timelineItemTextColor')}
            sx={{ borderColor: 'rgba(255,255,255,0.3)', color: 'rgba(255,255,255,0.9)' }}
          >
            <span style={{ display: 'inline-block', width: 16, height: 16, borderRadius: 3, background: curriculum.timelineItemTextColor || 'transparent', border: '1px solid rgba(255,255,255,0.2)' }} />
            &nbsp;Item text color
          </Button>
        </Box>
      </Grid>

      {/* Timeline Items List */}
      {timelineItems.map((item, idx) => (
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
            {/* First row: Title + delete */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <CustomTextField
                label="Step Title"
                value={item.title}
                onChange={(e) => updateTimelineItem(idx, 'title', e.target.value)}
                sx={{ flex: 1 }}
                placeholder="Enter step title..."
              />
              <IconButton
                onClick={() => removeTimelineItem(idx)}
                sx={{ color: 'rgba(255,255,255,0.5)' }}
                disabled={timelineItems.length <= 1}
              >
                <DeleteIcon />
              </IconButton>
            </Box>
            {/* Second row: Text */}
            <CustomTextField
              label="Step Description"
              value={item.text}
              onChange={(e) => updateTimelineItem(idx, 'text', e.target.value)}
              fullWidth
              multiline
              rows={2}
              placeholder="Enter step description..."
            />
          </Box>
        </Grid>
      ))}

      <Grid item xs={12}>
        <Button
          startIcon={<AddIcon />}
          onClick={addTimelineItem}
          variant="outlined"
          sx={{ borderColor: 'rgba(255,255,255,0.3)', color: 'rgba(255,255,255,0.9)' }}
        >
          Add Timeline Step
        </Button>
      </Grid>
    </Grid>
  );
}

export default CurriculumTabEditor;


