import React, { useState } from 'react';
import {
  Grid,
  Box,
  Typography,
  Button,
  Divider,
  IconButton,
  Alert,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';
import ColorPickerPopover from '../../components/ColorPickerPopover';
import { CustomTextField } from '../styles';
import { GradientEditor, parseGradientString, composeGradient } from './GradientEditor';
import {
  HearOurImpactContent,
  SpotifyEmbed,
} from '../../services/impact.api';

export interface HearOurImpactTabEditorProps {
  hearOurImpact: HearOurImpactContent;
  defaultSwatch: string[] | null;
  onHearOurImpactChange: (field: keyof HearOurImpactContent, value: unknown) => void;
}

type HearOurImpactColorField =
  | 'descriptionColor'
  | 'embedWrapperBgColor'
  | 'embedWrapperBorderColor'
  | 'buttonTextColor'
  | 'modalBorderColor'
  | 'modalTitleColor'
  | 'modalCardBgColor'
  | 'modalCardBorderColor';

type GradientField =
  | 'sectionBgGradient'
  | 'titleGradient'
  | 'buttonBgGradient'
  | 'modalBgGradient';

export function HearOurImpactTabEditor({
  hearOurImpact,
  defaultSwatch,
  onHearOurImpactChange,
}: HearOurImpactTabEditorProps) {
  const [colorPickerAnchor, setColorPickerAnchor] = useState<HTMLElement | null>(null);
  const [colorPickerField, setColorPickerField] = useState<HearOurImpactColorField | null>(null);

  // Gradient picker state
  const [gradientPickerAnchor, setGradientPickerAnchor] = useState<HTMLElement | null>(null);
  const [gradientPickerKey, setGradientPickerKey] = useState<GradientField | null>(null);
  const [gradientPickerColorIndex, setGradientPickerColorIndex] = useState<number>(0);

  // Color picker helpers
  const openColorPicker = (el: HTMLElement, field: HearOurImpactColorField) => {
    setColorPickerField(field);
    setColorPickerAnchor(el);
  };

  const handleColorChange = (color: string) => {
    if (colorPickerField) {
      onHearOurImpactChange(colorPickerField, color);
    }
  };

  const closeColorPicker = () => {
    setColorPickerAnchor(null);
    setColorPickerField(null);
  };

  const getColorValue = (field: HearOurImpactColorField): string => {
    return (hearOurImpact[field] as string) || '';
  };

  // Gradient helpers
  const getGradientValue = (key: GradientField): string => {
    return (hearOurImpact[key] as string) || '';
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
      onHearOurImpactChange(gradientPickerKey, newGradient);
      return;
    }
    const parsed = parseGradientString(currentGradient);
    const newColors = [...parsed.colors];
    newColors[gradientPickerColorIndex] = color;
    const newGradient = composeGradient(parsed.type, parsed.degree, newColors, parsed.opacity);
    onHearOurImpactChange(gradientPickerKey, newGradient);
  };

  const closeGradientPicker = () => {
    setGradientPickerAnchor(null);
    setGradientPickerKey(null);
  };

  // Embed helpers
  const featuredEmbeds: SpotifyEmbed[] = hearOurImpact.featuredEmbeds ?? [];
  const mentorProfileEmbeds: SpotifyEmbed[] = hearOurImpact.mentorProfileEmbeds ?? [];
  const allSongsEmbeds: SpotifyEmbed[] = hearOurImpact.allSongsEmbeds ?? [];

  const addEmbed = (field: 'featuredEmbeds' | 'mentorProfileEmbeds' | 'allSongsEmbeds', defaultType: SpotifyEmbed['type']) => {
    const current = hearOurImpact[field] ?? [];
    const newEmbed: SpotifyEmbed = {
      id: `embed-${Date.now()}`,
      url: '',
      type: defaultType,
    };
    onHearOurImpactChange(field, [...current, newEmbed]);
  };

  const updateEmbed = (
    field: 'featuredEmbeds' | 'mentorProfileEmbeds' | 'allSongsEmbeds',
    index: number,
    key: keyof SpotifyEmbed,
    value: string
  ) => {
    const current = [...(hearOurImpact[field] ?? [])];
    current[index] = { ...current[index], [key]: value };
    onHearOurImpactChange(field, current);
  };

  const removeEmbed = (field: 'featuredEmbeds' | 'mentorProfileEmbeds' | 'allSongsEmbeds', index: number) => {
    const current = hearOurImpact[field] ?? [];
    const updated = current.filter((_, i) => i !== index);
    onHearOurImpactChange(field, updated);
  };

  // Drag and drop for embeds
  const [draggedEmbed, setDraggedEmbed] = useState<{ field: string; index: number } | null>(null);
  const [dragOverEmbed, setDragOverEmbed] = useState<{ field: string; index: number } | null>(null);

  const handleEmbedDragStart = (field: string, index: number) => {
    setDraggedEmbed({ field, index });
  };

  const handleEmbedDragOver = (e: React.DragEvent, field: string, index: number) => {
    e.preventDefault();
    if (draggedEmbed?.field === field) {
      setDragOverEmbed({ field, index });
    }
  };

  const handleEmbedDragEnd = () => {
    if (draggedEmbed && dragOverEmbed && draggedEmbed.field === dragOverEmbed.field && draggedEmbed.index !== dragOverEmbed.index) {
      const field = draggedEmbed.field as 'featuredEmbeds' | 'mentorProfileEmbeds' | 'allSongsEmbeds';
      const current = [...(hearOurImpact[field] ?? [])];
      const [removed] = current.splice(draggedEmbed.index, 1);
      current.splice(dragOverEmbed.index, 0, removed);
      onHearOurImpactChange(field, current);
    }
    setDraggedEmbed(null);
    setDragOverEmbed(null);
  };

  const renderEmbedList = (
    field: 'featuredEmbeds' | 'mentorProfileEmbeds' | 'allSongsEmbeds',
    embeds: SpotifyEmbed[],
    defaultType: SpotifyEmbed['type'],
    label: string
  ) => (
    <>
      <Grid item xs={12}>
        <Typography variant="subtitle2" sx={{ mb: 1, color: 'rgba(255,255,255,0.7)' }}>
          {label}
        </Typography>
      </Grid>

      {embeds.map((embed, idx) => {
        const isDragging = draggedEmbed?.field === field && draggedEmbed?.index === idx;
        const isDragOver = dragOverEmbed?.field === field && dragOverEmbed?.index === idx;

        return (
          <Grid item xs={12} key={embed.id}>
            <Box
              draggable
              onDragStart={() => handleEmbedDragStart(field, idx)}
              onDragOver={(e) => handleEmbedDragOver(e, field, idx)}
              onDragEnd={handleEmbedDragEnd}
              sx={{
                display: 'flex',
                gap: 2,
                alignItems: 'center',
                p: 2,
                bgcolor: 'rgba(255,255,255,0.03)',
                borderRadius: 2,
                border: isDragOver
                  ? '2px dashed rgba(30, 215, 96, 0.8)'
                  : '1px solid rgba(255,255,255,0.08)',
                opacity: isDragging ? 0.5 : 1,
                cursor: 'grab',
              }}
            >
              <DragIndicatorIcon sx={{ color: 'rgba(255,255,255,0.3)' }} />
              <FormControl size="small" sx={{ minWidth: 100 }}>
                <InputLabel sx={{ color: 'rgba(255,255,255,0.5)' }}>Type</InputLabel>
                <Select
                  value={embed.type}
                  label="Type"
                  onChange={(e) => updateEmbed(field, idx, 'type', e.target.value)}
                  sx={{
                    color: 'white',
                    '.MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255,255,255,0.2)' },
                    '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255,255,255,0.3)' },
                  }}
                >
                  <MenuItem value="album">Album</MenuItem>
                  <MenuItem value="artist">Artist</MenuItem>
                  <MenuItem value="playlist">Playlist</MenuItem>
                  <MenuItem value="track">Track</MenuItem>
                </Select>
              </FormControl>
              <CustomTextField
                label="Spotify Embed URL"
                value={embed.url}
                onChange={(e) => updateEmbed(field, idx, 'url', e.target.value)}
                sx={{ flex: 1 }}
                placeholder="https://open.spotify.com/embed/..."
              />
              <IconButton
                onClick={() => removeEmbed(field, idx)}
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
          onClick={() => addEmbed(field, defaultType)}
          variant="outlined"
          size="small"
          sx={{ borderColor: 'rgba(255,255,255,0.3)', color: 'rgba(255,255,255,0.9)' }}
        >
          Add Embed
        </Button>
      </Grid>
    </>
  );

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
          onChange={(gradient) => onHearOurImpactChange('sectionBgGradient', gradient)}
          onColorClick={(el, idx) => openGradientPicker(el, 'sectionBgGradient', idx)}
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
          label="Title"
          value={hearOurImpact.title || ''}
          onChange={(e) => onHearOurImpactChange('title', e.target.value)}
          fullWidth
          placeholder="e.g., Hear our Impact"
        />
      </Grid>

      <Grid item xs={12}>
        <GradientEditor
          label="Title Gradient"
          value={getGradientValue('titleGradient')}
          onChange={(gradient) => onHearOurImpactChange('titleGradient', gradient)}
          onColorClick={(el, idx) => openGradientPicker(el, 'titleGradient', idx)}
        />
      </Grid>

      <Grid item xs={12}>
        <CustomTextField
          label="Description"
          value={hearOurImpact.description || ''}
          onChange={(e) => onHearOurImpactChange('description', e.target.value)}
          fullWidth
          multiline
          rows={2}
          placeholder="Explore our music on Spotify..."
        />
      </Grid>

      <Grid item xs={12}>
        <Button
          size="small"
          variant="outlined"
          onClick={(e) => openColorPicker(e.currentTarget, 'descriptionColor')}
          sx={{ borderColor: 'rgba(255,255,255,0.3)', color: 'rgba(255,255,255,0.9)' }}
        >
          <span style={{ display: 'inline-block', width: 16, height: 16, borderRadius: 3, background: hearOurImpact.descriptionColor || 'transparent', border: '1px solid rgba(255,255,255,0.2)' }} />
          &nbsp;Description color
        </Button>
      </Grid>

      {/* ─────────────────────────────────────────────────────────────────────── */}
      {/* EMBED CARD STYLING */}
      {/* ─────────────────────────────────────────────────────────────────────── */}
      <Grid item xs={12}>
        <Divider sx={{ my: 2, bgcolor: 'rgba(255,255,255,0.1)' }} />
        <Typography variant="h6" sx={{ mb: 2, color: 'rgba(255,255,255,0.9)' }}>
          Embed Card Styling
        </Typography>
      </Grid>

      <Grid item xs={12}>
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <Button
            size="small"
            variant="outlined"
            onClick={(e) => openColorPicker(e.currentTarget, 'embedWrapperBgColor')}
            sx={{ borderColor: 'rgba(255,255,255,0.3)', color: 'rgba(255,255,255,0.9)' }}
          >
            <span style={{ display: 'inline-block', width: 16, height: 16, borderRadius: 3, background: hearOurImpact.embedWrapperBgColor || 'transparent', border: '1px solid rgba(255,255,255,0.2)' }} />
            &nbsp;Card bg
          </Button>
          <Button
            size="small"
            variant="outlined"
            onClick={(e) => openColorPicker(e.currentTarget, 'embedWrapperBorderColor')}
            sx={{ borderColor: 'rgba(255,255,255,0.3)', color: 'rgba(255,255,255,0.9)' }}
          >
            <span style={{ display: 'inline-block', width: 16, height: 16, borderRadius: 3, background: hearOurImpact.embedWrapperBorderColor || 'transparent', border: '1px solid rgba(255,255,255,0.2)' }} />
            &nbsp;Card border
          </Button>
        </Box>
      </Grid>

      {/* ─────────────────────────────────────────────────────────────────────── */}
      {/* FEATURED EMBEDS */}
      {/* ─────────────────────────────────────────────────────────────────────── */}
      <Grid item xs={12}>
        <Divider sx={{ my: 2, bgcolor: 'rgba(255,255,255,0.1)' }} />
        <Typography variant="h6" sx={{ mb: 1, color: 'rgba(255,255,255,0.9)' }}>
          Featured Embeds (Main Grid)
        </Typography>
        <Alert severity="info" sx={{ mb: 2, bgcolor: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.8)' }}>
          These embeds appear in the main section grid. Drag to reorder.
        </Alert>
      </Grid>

      {renderEmbedList('featuredEmbeds', featuredEmbeds, 'album', 'Featured Spotify Embeds')}

      {/* ─────────────────────────────────────────────────────────────────────── */}
      {/* ACTION BUTTONS */}
      {/* ─────────────────────────────────────────────────────────────────────── */}
      <Grid item xs={12}>
        <Divider sx={{ my: 2, bgcolor: 'rgba(255,255,255,0.1)' }} />
        <Typography variant="h6" sx={{ mb: 2, color: 'rgba(255,255,255,0.9)' }}>
          Action Buttons
        </Typography>
      </Grid>

      <Grid item xs={12} md={6}>
        <CustomTextField
          label="Mentor Profiles Button Text"
          value={hearOurImpact.mentorProfilesButtonText || ''}
          onChange={(e) => onHearOurImpactChange('mentorProfilesButtonText', e.target.value)}
          fullWidth
          placeholder="e.g., Mentor Profiles"
        />
      </Grid>

      <Grid item xs={12} md={6}>
        <CustomTextField
          label="All Songs Button Text"
          value={hearOurImpact.allSongsButtonText || ''}
          onChange={(e) => onHearOurImpactChange('allSongsButtonText', e.target.value)}
          fullWidth
          placeholder="e.g., All Our Songs"
        />
      </Grid>

      <Grid item xs={12}>
        <GradientEditor
          label="Button Background Gradient"
          value={getGradientValue('buttonBgGradient')}
          onChange={(gradient) => onHearOurImpactChange('buttonBgGradient', gradient)}
          onColorClick={(el, idx) => openGradientPicker(el, 'buttonBgGradient', idx)}
        />
      </Grid>

      <Grid item xs={12}>
        <Button
          size="small"
          variant="outlined"
          onClick={(e) => openColorPicker(e.currentTarget, 'buttonTextColor')}
          sx={{ borderColor: 'rgba(255,255,255,0.3)', color: 'rgba(255,255,255,0.9)' }}
        >
          <span style={{ display: 'inline-block', width: 16, height: 16, borderRadius: 3, background: hearOurImpact.buttonTextColor || 'transparent', border: '1px solid rgba(255,255,255,0.2)' }} />
          &nbsp;Button text color
        </Button>
      </Grid>

      {/* ─────────────────────────────────────────────────────────────────────── */}
      {/* MENTOR PROFILES MODAL */}
      {/* ─────────────────────────────────────────────────────────────────────── */}
      <Grid item xs={12}>
        <Divider sx={{ my: 2, bgcolor: 'rgba(255,255,255,0.1)' }} />
        <Typography variant="h6" sx={{ mb: 2, color: 'rgba(255,255,255,0.9)' }}>
          Mentor Profiles Modal
        </Typography>
      </Grid>

      <Grid item xs={12} md={6}>
        <CustomTextField
          label="Modal Title"
          value={hearOurImpact.mentorProfilesModalTitle || ''}
          onChange={(e) => onHearOurImpactChange('mentorProfilesModalTitle', e.target.value)}
          fullWidth
          placeholder="e.g., Mentor Profiles"
        />
      </Grid>

      {renderEmbedList('mentorProfileEmbeds', mentorProfileEmbeds, 'artist', 'Mentor Artist Embeds')}

      {/* ─────────────────────────────────────────────────────────────────────── */}
      {/* ALL SONGS MODAL */}
      {/* ─────────────────────────────────────────────────────────────────────── */}
      <Grid item xs={12}>
        <Divider sx={{ my: 2, bgcolor: 'rgba(255,255,255,0.1)' }} />
        <Typography variant="h6" sx={{ mb: 2, color: 'rgba(255,255,255,0.9)' }}>
          All Songs Modal
        </Typography>
      </Grid>

      <Grid item xs={12} md={6}>
        <CustomTextField
          label="Modal Title"
          value={hearOurImpact.allSongsModalTitle || ''}
          onChange={(e) => onHearOurImpactChange('allSongsModalTitle', e.target.value)}
          fullWidth
          placeholder="e.g., All Our Songs"
        />
      </Grid>

      {renderEmbedList('allSongsEmbeds', allSongsEmbeds, 'playlist', 'All Songs Embeds')}

      {/* ─────────────────────────────────────────────────────────────────────── */}
      {/* MODAL STYLING */}
      {/* ─────────────────────────────────────────────────────────────────────── */}
      <Grid item xs={12}>
        <Divider sx={{ my: 2, bgcolor: 'rgba(255,255,255,0.1)' }} />
        <Typography variant="h6" sx={{ mb: 2, color: 'rgba(255,255,255,0.9)' }}>
          Modal Styling
        </Typography>
      </Grid>

      <Grid item xs={12}>
        <GradientEditor
          label="Modal Background Gradient"
          value={getGradientValue('modalBgGradient')}
          onChange={(gradient) => onHearOurImpactChange('modalBgGradient', gradient)}
          onColorClick={(el, idx) => openGradientPicker(el, 'modalBgGradient', idx)}
        />
      </Grid>

      <Grid item xs={12}>
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <Button
            size="small"
            variant="outlined"
            onClick={(e) => openColorPicker(e.currentTarget, 'modalBorderColor')}
            sx={{ borderColor: 'rgba(255,255,255,0.3)', color: 'rgba(255,255,255,0.9)' }}
          >
            <span style={{ display: 'inline-block', width: 16, height: 16, borderRadius: 3, background: hearOurImpact.modalBorderColor || 'transparent', border: '1px solid rgba(255,255,255,0.2)' }} />
            &nbsp;Modal border
          </Button>
          <Button
            size="small"
            variant="outlined"
            onClick={(e) => openColorPicker(e.currentTarget, 'modalTitleColor')}
            sx={{ borderColor: 'rgba(255,255,255,0.3)', color: 'rgba(255,255,255,0.9)' }}
          >
            <span style={{ display: 'inline-block', width: 16, height: 16, borderRadius: 3, background: hearOurImpact.modalTitleColor || 'transparent', border: '1px solid rgba(255,255,255,0.2)' }} />
            &nbsp;Modal title
          </Button>
          <Button
            size="small"
            variant="outlined"
            onClick={(e) => openColorPicker(e.currentTarget, 'modalCardBgColor')}
            sx={{ borderColor: 'rgba(255,255,255,0.3)', color: 'rgba(255,255,255,0.9)' }}
          >
            <span style={{ display: 'inline-block', width: 16, height: 16, borderRadius: 3, background: hearOurImpact.modalCardBgColor || 'transparent', border: '1px solid rgba(255,255,255,0.2)' }} />
            &nbsp;Modal card bg
          </Button>
          <Button
            size="small"
            variant="outlined"
            onClick={(e) => openColorPicker(e.currentTarget, 'modalCardBorderColor')}
            sx={{ borderColor: 'rgba(255,255,255,0.3)', color: 'rgba(255,255,255,0.9)' }}
          >
            <span style={{ display: 'inline-block', width: 16, height: 16, borderRadius: 3, background: hearOurImpact.modalCardBorderColor || 'transparent', border: '1px solid rgba(255,255,255,0.2)' }} />
            &nbsp;Modal card border
          </Button>
        </Box>
      </Grid>
    </Grid>
  );
}

export default HearOurImpactTabEditor;

