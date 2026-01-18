import React, { useState } from 'react';
import {
  Grid,
  Box,
  Typography,
  Button,
  Divider,
  FormControlLabel,
  Switch,
  MenuItem,
  Card,
  CardContent,
  IconButton,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import ColorPickerPopover from '../../components/ColorPickerPopover';
import IconSelector, { IMPACT_ICON_LIBRARY, ImpactIconKey } from '../../components/IconSelector';
import { CustomTextField } from '../styles';
import { GradientEditor, parseGradientString, composeGradient } from './GradientEditor';
import {
  MissionSectionForm,
  MissionTextAlign,
  MissionStatAction,
  MissionStatNumberSource,
  MissionBadgeIcon,
  MISSION_TEXT_ALIGN_OPTIONS,
} from '../types';
import COLORS from '../../../assets/colors';
import { v4 as uuidv4 } from 'uuid';

type MissionColorPickerField =
  | 'statementTitleColor'
  | 'statementTextColor'
  | 'statementMetaColor'
  | 'serialColor'
  | 'badgeTextColor'
  | 'badgeBgColor'
  | 'badgeBorderColor'
  | 'statsTitleColor'
  | 'overlayColor1'
  | 'overlayColor2'
  | 'ticketBorderColor'
  | 'ticketBackdropColor'
  | 'ticketBlotch1Color'
  | 'ticketBlotch2Color'
  | 'statementBoxBorderColor'
  | 'statementBoxBgColor'
  | 'barcodeColor'
  | 'statCardBgColor';

// Gradient keys for the gradient color picker
type GradientKey = 'titleGradient' | 'titleUnderlineGradient' | 'ticketStripeGradient' | 'backgroundGradient';

export interface MissionTabEditorProps {
  mission: MissionSectionForm;
  defaultSwatch: string[] | null;
  onMissionChange: (field: keyof MissionSectionForm, value: any) => void;
}

export function MissionTabEditor({
  mission,
  defaultSwatch,
  onMissionChange,
}: MissionTabEditorProps) {
  const [missionColorPickerAnchor, setMissionColorPickerAnchor] = useState<HTMLElement | null>(null);
  const [missionColorPickerField, setMissionColorPickerField] = useState<MissionColorPickerField | null>(null);
  const missionPickerOpen = Boolean(missionColorPickerAnchor);

  // State for gradient color picker
  const [gradientPickerAnchor, setGradientPickerAnchor] = useState<HTMLElement | null>(null);
  const [gradientPickerKey, setGradientPickerKey] = useState<GradientKey | null>(null);
  const [gradientPickerColorIndex, setGradientPickerColorIndex] = useState<number>(0);
  const gradientPickerOpen = Boolean(gradientPickerAnchor);

  // State for Mission Stats color picker
  const [missionStatColorPickerAnchor, setMissionStatColorPickerAnchor] = useState<HTMLElement | null>(null);
  const [missionStatColorPickerIndex, setMissionStatColorPickerIndex] = useState<number | null>(null);
  const missionStatPickerOpen = Boolean(missionStatColorPickerAnchor);
  const currentMissionStatPickerColor =
    missionStatColorPickerIndex !== null && mission.stats[missionStatColorPickerIndex]
      ? mission.stats[missionStatColorPickerIndex].color || '#22C55E'
      : '#22C55E';

  const badgeIconConfig =
    mission.badgeIcon ?? ({ type: 'glyph', value: '♫' } as MissionBadgeIcon);
  const badgeIconType = badgeIconConfig.type ?? 'glyph';
  const badgeIconValue = badgeIconConfig.value ?? '♫';

  // Get gradient values - only returns what's in the database (no defaults)
  const getDefaultGradient = (key: GradientKey): string => {
    switch (key) {
      case 'titleGradient':
        return mission.titleGradient || '';
      case 'titleUnderlineGradient':
        return mission.titleUnderlineGradient || '';
      case 'ticketStripeGradient':
        return mission.ticketStripeGradient || '';
      case 'backgroundGradient':
        return mission.backgroundGradient || '';
      default:
        return '';
    }
  };

  // Helper to check if a gradient is missing
  const isGradientMissing = (value: string | null | undefined): boolean => !value || value.trim() === '';

  // Helper to check if a color field is missing (null, undefined, or empty string)
  const isColorMissing = (value: string | null | undefined): boolean => !value || value.trim() === '';

  // Style for buttons with missing values
  const missingFieldStyle = {
    borderColor: 'rgba(244, 67, 54, 0.7)',
    color: 'rgba(244, 67, 54, 0.9)',
    '&:hover': { borderColor: '#f44336' },
  };

  const normalFieldStyle = {
    borderColor: 'rgba(255,255,255,0.3)',
    color: 'rgba(255,255,255,0.9)',
  };

  const getColorButtonStyle = (value: string | null | undefined) => 
    isColorMissing(value) ? missingFieldStyle : normalFieldStyle;

  const getCurrentMissionPickerColor = (): string => {
    if (!missionColorPickerField) return '#000000';
    switch (missionColorPickerField) {
      case 'statementTitleColor':
        return mission.statementTitleColor || '';
      case 'statementTextColor':
        return mission.statementTextColor || '';
      case 'statementMetaColor':
        return mission.statementMetaColor || '';
      case 'serialColor':
        return mission.serialColor || '';
      case 'badgeTextColor':
        return mission.badgeTextColor || '';
      case 'badgeBgColor':
        return mission.badgeBgColor || '';
      case 'badgeBorderColor':
        return mission.badgeBorderColor || '';
      case 'statsTitleColor':
        return mission.statsTitleColor || '';
      case 'overlayColor1':
        return mission.overlayColor1 || '';
      case 'overlayColor2':
        return mission.overlayColor2 || '';
      case 'ticketBorderColor':
        return mission.ticketBorderColor || '';
      case 'ticketBackdropColor':
        return mission.ticketBackdropColor || '';
      case 'ticketBlotch1Color':
        return mission.ticketBlotch1Color || '';
      case 'ticketBlotch2Color':
        return mission.ticketBlotch2Color || '';
      case 'statementBoxBorderColor':
        return mission.statementBoxBorderColor || '';
      case 'statementBoxBgColor':
        return mission.statementBoxBgColor || '';
      case 'barcodeColor':
        return mission.barcodeColor || '';
      case 'statCardBgColor':
        return mission.statCardBgColor || '';
      default:
        return '';
    }
  };

  // Get current gradient color for the picker
  const getGradientPickerColor = (): string => {
    if (!gradientPickerKey) return '#000000';
    const gradient = getDefaultGradient(gradientPickerKey);
    const parsed = parseGradientString(gradient);
    return parsed.colors[gradientPickerColorIndex] || '#000000';
  };

  const openPicker = (field: MissionColorPickerField, el: HTMLElement) => {
    setMissionColorPickerField(field);
    setMissionColorPickerAnchor(el);
  };

  const openGradientPicker = (el: HTMLElement, key: GradientKey, colorIndex: number) => {
    setGradientPickerKey(key);
    setGradientPickerColorIndex(colorIndex);
    setGradientPickerAnchor(el);
  };

  const handleColorChange = (val: string) => {
    if (!missionColorPickerField) return;
    onMissionChange(missionColorPickerField as keyof MissionSectionForm, val);
  };

  const handleGradientColorChange = (val: string) => {
    if (!gradientPickerKey) return;
    const currentGradient = getDefaultGradient(gradientPickerKey);
    const parsed = parseGradientString(currentGradient);
    const newColors = [...parsed.colors];
    newColors[gradientPickerColorIndex] = val;
    
    // Compose the new gradient
    const newGradient = composeGradient(parsed.type, parsed.degree, newColors, parsed.opacity);
    onMissionChange(gradientPickerKey, newGradient);
  };

  return (
    <Box>
      {/* Page Header */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 3,
        }}
      >
        <Typography
          variant="h5"
          sx={{
            fontFamily: "'Airwaves', 'Century Gothic', 'Arial', sans-serif",
          }}
        >
          Mission Section
        </Typography>
      </Box>
      <Divider sx={{ mb: 3, bgcolor: 'rgba(255,255,255,0.1)' }} />

      <Grid container spacing={{ xs: 2, md: 3 }}>
        {/* ========================================== */}
        {/* SECTION SETTINGS */}
        {/* ========================================== */}
        <Grid item xs={12}>
          <Typography variant="h6" sx={{ mb: 1.5 }}>
            Section Settings
          </Typography>
        </Grid>
        <Grid item xs={12} md={6}>
          <CustomTextField
            label="ARIA Label"
            value={mission.ariaLabel}
            onChange={(e) => onMissionChange('ariaLabel', e.target.value)}
            fullWidth
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <CustomTextField
            select
            label="Text Alignment"
            value={mission.textAlign}
            onChange={(e) => onMissionChange('textAlign', e.target.value as MissionTextAlign)}
            fullWidth
          >
            {MISSION_TEXT_ALIGN_OPTIONS.map((option) => (
              <MenuItem key={option} value={option}>
                {option.charAt(0).toUpperCase() + option.slice(1)}
              </MenuItem>
            ))}
          </CustomTextField>
        </Grid>

        {/* ========================================== */}
        {/* SECTION BACKGROUND */}
        {/* ========================================== */}
        <Grid item xs={12}>
          <Divider sx={{ my: 1.5, bgcolor: 'rgba(255,255,255,0.08)' }} />
          <Typography variant="h6" sx={{ mb: 1.5 }}>
            Section Background
          </Typography>
        </Grid>
        <Grid item xs={12}>
          <GradientEditor
            label="Background Gradient"
            value={getDefaultGradient('backgroundGradient')}
            onChange={(gradient) => onMissionChange('backgroundGradient', gradient)}
            onPickColor={(el, colorIndex) => openGradientPicker(el, 'backgroundGradient', colorIndex)}
          />
        </Grid>
        <Grid item xs={12}>
          <Typography variant="subtitle2" sx={{ mb: 1 }}>
            Background Overlay (Radial Glows)
          </Typography>
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', alignItems: 'center' }}>
            <Button
              size="small"
              variant="outlined"
              onClick={(e) => openPicker('overlayColor1', e.currentTarget)}
              sx={getColorButtonStyle(mission.overlayColor1)}
            >
              <span style={{ display: 'inline-block', width: 16, height: 16, borderRadius: 3, background: mission.overlayColor1 || 'transparent', border: '1px solid rgba(255,255,255,0.2)' }} />
              &nbsp;Overlay 1 (top-left)
            </Button>
            <Button
              size="small"
              variant="outlined"
              onClick={(e) => openPicker('overlayColor2', e.currentTarget)}
              sx={getColorButtonStyle(mission.overlayColor2)}
            >
              <span style={{ display: 'inline-block', width: 16, height: 16, borderRadius: 3, background: mission.overlayColor2 || 'transparent', border: '1px solid rgba(255,255,255,0.2)' }} />
              &nbsp;Overlay 2 (bottom-right)
            </Button>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, ml: 2 }}>
              <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                Opacity: {Math.round((mission.overlayOpacity ?? 1) * 100)}%
              </Typography>
              <input
                type="range"
                min={0}
                max={100}
                value={Math.round((mission.overlayOpacity ?? 1) * 100)}
                onChange={(e) => onMissionChange('overlayOpacity', Number(e.target.value) / 100)}
                style={{ width: 100 }}
              />
            </Box>
          </Box>
        </Grid>

        {/* ========================================== */}
        {/* HEADER (Title & Badge) */}
        {/* ========================================== */}
        <Grid item xs={12}>
          <Divider sx={{ my: 1.5, bgcolor: 'rgba(255,255,255,0.08)' }} />
          <Typography variant="h6" sx={{ mb: 1.5 }}>
            Header
          </Typography>
        </Grid>
        <Grid item xs={12}>
          <CustomTextField
            label="Section Title"
            value={mission.title}
            onChange={(e) => onMissionChange('title', e.target.value)}
            fullWidth
          />
          <GradientEditor
            label="Title Gradient"
            value={getDefaultGradient('titleGradient')}
            onChange={(gradient) => onMissionChange('titleGradient', gradient)}
            onPickColor={(el, colorIndex) => openGradientPicker(el, 'titleGradient', colorIndex)}
          />
          <GradientEditor
            label="Title Underline Gradient"
            value={getDefaultGradient('titleUnderlineGradient')}
            onChange={(gradient) => onMissionChange('titleUnderlineGradient', gradient)}
            onPickColor={(el, colorIndex) => openGradientPicker(el, 'titleUnderlineGradient', colorIndex)}
          />
        </Grid>
        <Grid item xs={12}>
          <Typography variant="subtitle2" sx={{ mb: 1 }}>Badge</Typography>
          <CustomTextField
            label="Badge Label"
            value={mission.badgeLabel}
            onChange={(e) => onMissionChange('badgeLabel', e.target.value)}
            fullWidth
          />
          <CustomTextField
            select
            label="Badge Icon Type"
            value={badgeIconType}
            onChange={(e) => {
              const nextType = e.target.value as MissionBadgeIcon['type'];
              const fallbackValue =
                nextType === 'glyph'
                  ? badgeIconType === 'glyph' ? badgeIconValue : '♫'
                  : badgeIconType === 'iconKey' && badgeIconValue ? badgeIconValue : (IMPACT_ICON_LIBRARY[0]?.key ?? '');
              onMissionChange('badgeIcon', { type: nextType, value: fallbackValue });
            }}
            fullWidth
            sx={{ mt: 2 }}
          >
            <MenuItem value="glyph">Glyph</MenuItem>
            <MenuItem value="iconKey">Icon</MenuItem>
          </CustomTextField>
          {badgeIconType === 'glyph' ? (
            <CustomTextField
              label="Badge Glyph"
              value={badgeIconValue}
              onChange={(e) => onMissionChange('badgeIcon', { type: 'glyph', value: e.target.value })}
              fullWidth
              sx={{ mt: 2 }}
              placeholder="e.g. ♫"
            />
          ) : (
            <Box sx={{ mt: 2 }}>
              <IconSelector
                label="Badge Icon"
                value={(badgeIconValue as ImpactIconKey) || ''}
                onChange={(iconKey) => onMissionChange('badgeIcon', { type: 'iconKey', value: iconKey })}
                allowNone={false}
              />
            </Box>
          )}
          <Box sx={{ mt: 2, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            <Button size="small" variant="outlined" onClick={(e) => openPicker('badgeTextColor', e.currentTarget)} sx={getColorButtonStyle(mission.badgeTextColor)}>
              <span style={{ display: 'inline-block', width: 16, height: 16, borderRadius: 3, background: mission.badgeTextColor || 'transparent', border: '1px solid rgba(255,255,255,0.2)' }} />
              &nbsp;Badge text
            </Button>
            <Button size="small" variant="outlined" onClick={(e) => openPicker('badgeBgColor', e.currentTarget)} sx={getColorButtonStyle(mission.badgeBgColor)}>
              <span style={{ display: 'inline-block', width: 16, height: 16, borderRadius: 3, background: mission.badgeBgColor || 'transparent', border: '1px solid rgba(255,255,255,0.2)' }} />
              &nbsp;Badge background
            </Button>
            <Button size="small" variant="outlined" onClick={(e) => openPicker('badgeBorderColor', e.currentTarget)} sx={getColorButtonStyle(mission.badgeBorderColor)}>
              <span style={{ display: 'inline-block', width: 16, height: 16, borderRadius: 3, background: mission.badgeBorderColor || 'transparent', border: '1px solid rgba(255,255,255,0.2)' }} />
              &nbsp;Badge border
            </Button>
          </Box>
        </Grid>

        {/* ========================================== */}
        {/* TICKET */}
        {/* ========================================== */}
        <Grid item xs={12}>
          <Divider sx={{ my: 1.5, bgcolor: 'rgba(255,255,255,0.08)' }} />
          <Typography variant="h6" sx={{ mb: 1.5 }}>
            Ticket
          </Typography>
        </Grid>
        
        {/* Ticket Styling */}
        <Grid item xs={12}>
          <Typography variant="subtitle2" sx={{ mb: 1 }}>Ticket Container</Typography>
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', alignItems: 'center', mb: 2 }}>
            <Button size="small" variant="outlined" onClick={(e) => openPicker('ticketBorderColor', e.currentTarget)} sx={getColorButtonStyle(mission.ticketBorderColor)}>
              <span style={{ display: 'inline-block', width: 16, height: 16, borderRadius: 3, background: mission.ticketBorderColor || 'transparent', border: '1px solid rgba(255,255,255,0.2)' }} />
              &nbsp;Border
            </Button>
            <Button size="small" variant="outlined" onClick={(e) => openPicker('ticketBackdropColor', e.currentTarget)} sx={getColorButtonStyle(mission.ticketBackdropColor)}>
              <span style={{ display: 'inline-block', width: 16, height: 16, borderRadius: 3, background: mission.ticketBackdropColor || 'transparent', border: '1px solid rgba(255,255,255,0.2)' }} />
              &nbsp;Backdrop
            </Button>
            <Button size="small" variant="outlined" onClick={(e) => openPicker('ticketBlotch1Color', e.currentTarget)} sx={getColorButtonStyle(mission.ticketBlotch1Color)}>
              <span style={{ display: 'inline-block', width: 16, height: 16, borderRadius: 3, background: mission.ticketBlotch1Color || 'transparent', border: '1px solid rgba(255,255,255,0.2)' }} />
              &nbsp;Glow 1
            </Button>
            <Button size="small" variant="outlined" onClick={(e) => openPicker('ticketBlotch2Color', e.currentTarget)} sx={getColorButtonStyle(mission.ticketBlotch2Color)}>
              <span style={{ display: 'inline-block', width: 16, height: 16, borderRadius: 3, background: mission.ticketBlotch2Color || 'transparent', border: '1px solid rgba(255,255,255,0.2)' }} />
              &nbsp;Glow 2
            </Button>
          </Box>
          <GradientEditor
            label="Stripe Gradient (left edge)"
            value={getDefaultGradient('ticketStripeGradient')}
            onChange={(gradient) => onMissionChange('ticketStripeGradient', gradient)}
            onPickColor={(el, colorIndex) => openGradientPicker(el, 'ticketStripeGradient', colorIndex)}
          />
        </Grid>

        {/* Background Logo */}
        <Grid item xs={12}>
          <Typography variant="subtitle2" sx={{ mb: 1 }}>Background Logo (Watermark)</Typography>
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
            <FormControlLabel
              control={
                <Switch
                  checked={mission.backgroundLogoEnabled !== false}
                  onChange={(e) => onMissionChange('backgroundLogoEnabled', e.target.checked)}
                  sx={{ '& .MuiSwitch-switchBase.Mui-checked': { color: COLORS.gogo_blue }, '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { backgroundColor: COLORS.gogo_blue } }}
                />
              }
              label="Show logo"
              sx={{ color: 'white' }}
            />
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                Opacity: {Math.round((mission.backgroundLogoOpacity ?? 0.08) * 100)}%
              </Typography>
              <input type="range" min={0} max={100} value={Math.round((mission.backgroundLogoOpacity ?? 0.08) * 100)} onChange={(e) => onMissionChange('backgroundLogoOpacity', Number(e.target.value) / 100)} style={{ width: 80 }} />
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                Scale: {(mission.backgroundLogoScale ?? 0.82).toFixed(2)}
              </Typography>
              <input type="range" min={20} max={200} value={Math.round((mission.backgroundLogoScale ?? 0.82) * 100)} onChange={(e) => onMissionChange('backgroundLogoScale', Number(e.target.value) / 100)} style={{ width: 80 }} />
            </Box>
          </Box>
        </Grid>

        {/* Statement Content */}
        <Grid item xs={12}>
          <Typography variant="subtitle2" sx={{ mb: 1 }}>Statement Content</Typography>
        </Grid>
        <Grid item xs={12}>
          <CustomTextField
            label="Statement Title (header line)"
            value={mission.statementTitle}
            onChange={(e) => onMissionChange('statementTitle', e.target.value)}
            fullWidth
          />
          <Box sx={{ mt: 1 }}>
            <Button size="small" variant="outlined" onClick={(e) => openPicker('statementTitleColor', e.currentTarget)} sx={getColorButtonStyle(mission.statementTitleColor)}>
              <span style={{ display: 'inline-block', width: 16, height: 16, borderRadius: 3, background: mission.statementTitleColor || 'transparent', border: '1px solid rgba(255,255,255,0.2)' }} />
              &nbsp;Title color
            </Button>
          </Box>
        </Grid>
        <Grid item xs={12}>
          <CustomTextField
            label="Statement Text"
            value={mission.statementText}
            onChange={(e) => onMissionChange('statementText', e.target.value)}
            fullWidth
            multiline
            minRows={4}
          />
          <Box sx={{ mt: 1 }}>
            <Button size="small" variant="outlined" onClick={(e) => openPicker('statementTextColor', e.currentTarget)} sx={getColorButtonStyle(mission.statementTextColor)}>
              <span style={{ display: 'inline-block', width: 16, height: 16, borderRadius: 3, background: mission.statementTextColor || 'transparent', border: '1px solid rgba(255,255,255,0.2)' }} />
              &nbsp;Text color
            </Button>
          </Box>
        </Grid>
        <Grid item xs={12} md={6}>
          <CustomTextField
            label="Statement Meta (footer line)"
            value={mission.statementMeta}
            onChange={(e) => onMissionChange('statementMeta', e.target.value)}
            fullWidth
          />
          <Box sx={{ mt: 1 }}>
            <Button size="small" variant="outlined" onClick={(e) => openPicker('statementMetaColor', e.currentTarget)} sx={getColorButtonStyle(mission.statementMetaColor)}>
              <span style={{ display: 'inline-block', width: 16, height: 16, borderRadius: 3, background: mission.statementMetaColor || 'transparent', border: '1px solid rgba(255,255,255,0.2)' }} />
              &nbsp;Meta color
            </Button>
          </Box>
        </Grid>
        <Grid item xs={12} md={6}>
          <CustomTextField
            label="Serial Number"
            value={mission.serial}
            onChange={(e) => onMissionChange('serial', e.target.value)}
            fullWidth
          />
          <Box sx={{ mt: 1 }}>
            <Button size="small" variant="outlined" onClick={(e) => openPicker('serialColor', e.currentTarget)} sx={getColorButtonStyle(mission.serialColor)}>
              <span style={{ display: 'inline-block', width: 16, height: 16, borderRadius: 3, background: mission.serialColor || 'transparent', border: '1px solid rgba(255,255,255,0.2)' }} />
              &nbsp;Serial color
            </Button>
          </Box>
        </Grid>

        {/* Statement Box Styling */}
        <Grid item xs={12}>
          <Typography variant="subtitle2" sx={{ mb: 1 }}>Statement Box Styling</Typography>
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', alignItems: 'center' }}>
            <Button size="small" variant="outlined" onClick={(e) => openPicker('statementBoxBorderColor', e.currentTarget)} sx={getColorButtonStyle(mission.statementBoxBorderColor)}>
              <span style={{ display: 'inline-block', width: 16, height: 16, borderRadius: 3, background: mission.statementBoxBorderColor || 'transparent', border: '1px solid rgba(255,255,255,0.2)' }} />
              &nbsp;Box border
            </Button>
            <Button size="small" variant="outlined" onClick={(e) => openPicker('statementBoxBgColor', e.currentTarget)} sx={getColorButtonStyle(mission.statementBoxBgColor)}>
              <span style={{ display: 'inline-block', width: 16, height: 16, borderRadius: 3, background: mission.statementBoxBgColor || 'transparent', border: '1px solid rgba(255,255,255,0.2)' }} />
              &nbsp;Box background
            </Button>
          </Box>
        </Grid>

        {/* Barcode */}
        <Grid item xs={12}>
          <Typography variant="subtitle2" sx={{ mb: 1 }}>Barcode (Stub)</Typography>
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', alignItems: 'center' }}>
            <FormControlLabel
              control={
                <Switch
                  checked={mission.ticketShowBarcode !== false}
                  onChange={(e) => onMissionChange('ticketShowBarcode', e.target.checked)}
                  sx={{ '& .MuiSwitch-switchBase.Mui-checked': { color: COLORS.gogo_blue }, '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { backgroundColor: COLORS.gogo_blue } }}
                />
              }
              label="Show barcode"
              sx={{ color: 'white' }}
            />
            <Button size="small" variant="outlined" onClick={(e) => openPicker('barcodeColor', e.currentTarget)} sx={getColorButtonStyle(mission.barcodeColor)}>
              <span style={{ display: 'inline-block', width: 16, height: 16, borderRadius: 3, background: mission.barcodeColor || 'transparent', border: '1px solid rgba(255,255,255,0.2)' }} />
              &nbsp;Barcode color
            </Button>
          </Box>
        </Grid>

        {/* ========================================== */}
        {/* STAT CARDS */}
        {/* ========================================== */}
        <Grid item xs={12}>
          <Divider sx={{ my: 1.5, bgcolor: 'rgba(255,255,255,0.08)' }} />
          <Typography variant="h6" sx={{ mb: 1.5 }}>
            Stat Cards
          </Typography>
        </Grid>
        
        {/* Stats Title & Styling */}
        <Grid item xs={12} md={6}>
          <CustomTextField
            label="Stats Section Title"
            value={mission.statsTitle || ''}
            onChange={(e) => onMissionChange('statsTitle', e.target.value)}
            fullWidth
            placeholder="At a Glance"
          />
          <Box sx={{ mt: 1 }}>
            <Button size="small" variant="outlined" onClick={(e) => openPicker('statsTitleColor', e.currentTarget)} sx={getColorButtonStyle(mission.statsTitleColor)}>
              <span style={{ display: 'inline-block', width: 16, height: 16, borderRadius: 3, background: mission.statsTitleColor || 'transparent', border: '1px solid rgba(255,255,255,0.2)' }} />
              &nbsp;Title color
            </Button>
          </Box>
        </Grid>
        <Grid item xs={12} md={6}>
          <Typography variant="subtitle2" sx={{ mb: 1 }}>Card Styling</Typography>
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', alignItems: 'center' }}>
            <Button size="small" variant="outlined" onClick={(e) => openPicker('statCardBgColor', e.currentTarget)} sx={getColorButtonStyle(mission.statCardBgColor)}>
              <span style={{ display: 'inline-block', width: 16, height: 16, borderRadius: 3, background: mission.statCardBgColor || 'transparent', border: '1px solid rgba(255,255,255,0.2)' }} />
              &nbsp;Card background
            </Button>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
            <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.7)' }}>
              Border width: {mission.statCardBorderWidth ?? 4}px
            </Typography>
            <input type="range" min={0} max={12} value={mission.statCardBorderWidth ?? 4} onChange={(e) => onMissionChange('statCardBorderWidth', Number(e.target.value))} style={{ width: 100 }} />
          </Box>
        </Grid>

        {/* Equalizer */}
        <Grid item xs={12} md={6}>
          <FormControlLabel
            control={
              <Switch
                checked={mission.statsEqualizer.enabled}
                onChange={(e) => onMissionChange('statsEqualizer', { ...mission.statsEqualizer, enabled: e.target.checked })}
              />
            }
            label="Show equalizer bars"
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <Typography variant="body2" sx={{ opacity: 0.8 }}>
            Equalizer Bars: {mission.statsEqualizer.barCount}
          </Typography>
          <input
            type="range"
            min={1}
            max={24}
            value={mission.statsEqualizer.barCount}
            onChange={(e) => onMissionChange('statsEqualizer', { ...mission.statsEqualizer, barCount: Number(e.target.value) })}
            style={{ width: '100%' }}
            disabled={!mission.statsEqualizer.enabled}
          />
        </Grid>

        {/* Individual Stats */}
        {mission.stats.map((s, idx) => {
          const isStudents = s.id === 'students';
          const isMentors = s.id === 'mentors';
          const isSites = s.id === 'sites';
          const isDisciplines = s.id === 'disciplines';
          // Check if this is one of the 4 special boxes that cannot be deleted
          const isSpecialBox = isStudents || isMentors || isSites || isDisciplines;
          const displayLabel = s.label || (isStudents ? 'Students' : isMentors ? 'Paid Mentors' : isSites ? 'Sites' : isDisciplines ? 'Disciplines' : 'Stat Item');

          return (
            <Grid item xs={12} key={`mission-stat-${s.id}`}>
              <Box sx={{ mb: 1.5, mt: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.1)', pb: 1 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 600, color: 'rgba(255,255,255,0.9)' }}>{displayLabel}</Typography>
                {isStudents && (
                  <FormControlLabel control={<Switch checked={s.action === 'openStudentMusicModal'} onChange={(e) => { const next = [...mission.stats]; next[idx] = { ...s, action: e.target.checked ? 'openStudentMusicModal' as MissionStatAction : 'none' as MissionStatAction }; onMissionChange('stats', next); }} />} label="Interactive (Music Modal)" />
                )}
                {isMentors && (
                  <FormControlLabel control={<Switch checked={s.action === 'openMentorMusicModal'} onChange={(e) => { const next = [...mission.stats]; next[idx] = { ...s, action: e.target.checked ? 'openMentorMusicModal' as MissionStatAction : 'none' as MissionStatAction }; onMissionChange('stats', next); }} />} label="Interactive (Music Modal)" />
                )}
                {isSites && (
                  <FormControlLabel control={<Switch checked={s.action === 'openMapModal' || s.action === 'scrollToMap'} onChange={(e) => { const next = [...mission.stats]; next[idx] = { ...s, action: e.target.checked ? 'openMapModal' as MissionStatAction : 'none' as MissionStatAction }; onMissionChange('stats', next); }} />} label="Interactive (Map Modal)" />
                )}
                {isDisciplines && (
                  <FormControlLabel control={<Switch checked={s.action === 'openDisciplinesModal' || (s.action === 'openModal' && s.modalId === 'disciplines')} onChange={(e) => { const next = [...mission.stats]; next[idx] = { ...s, action: e.target.checked ? 'openDisciplinesModal' as MissionStatAction : 'none' as MissionStatAction, modalId: e.target.checked ? 'disciplines' : null }; onMissionChange('stats', next); }} />} label="Interactive (Disciplines Modal)" />
                )}
              </Box>
              <Card variant="outlined" sx={{ bgcolor: 'transparent' }}>
                <CardContent>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <CustomTextField label="Label" value={s.label} onChange={(e) => { const next = [...mission.stats]; next[idx] = { ...s, label: e.target.value }; onMissionChange('stats', next); }} fullWidth />
                    {isDisciplines || isSites ? (
                      <Grid container spacing={2}>
                        <Grid item xs={12} sm={6}>
                          <CustomTextField select label="Number Source" value={s.numberSource || 'explicit'} onChange={(e) => { const next = [...mission.stats]; next[idx] = { ...s, numberSource: e.target.value as MissionStatNumberSource }; onMissionChange('stats', next); }} fullWidth>
                            <MenuItem value="explicit">Manual value</MenuItem>
                            {isDisciplines && <MenuItem value="modalItemsLength">Disciplines count</MenuItem>}
                            {isSites && <MenuItem value="mapLocationsLength">Map sites count</MenuItem>}
                          </CustomTextField>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          {s.numberSource === 'explicit' ? (
                            <CustomTextField label="Number" value={String(s.number ?? '')} onChange={(e) => { const next = [...mission.stats]; next[idx] = { ...s, number: e.target.value }; onMissionChange('stats', next); }} fullWidth />
                          ) : (
                            <Box sx={{ p: 1.5, border: '1px dashed rgba(255,255,255,0.2)', borderRadius: 1, color: 'rgba(255,255,255,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                              <Typography variant="caption">Value pulled from {isDisciplines ? 'Disciplines' : 'Map'}</Typography>
                            </Box>
                          )}
                        </Grid>
                      </Grid>
                    ) : (
                      <CustomTextField label="Number" value={String(s.number ?? '')} onChange={(e) => { const next = [...mission.stats]; next[idx] = { ...s, number: e.target.value }; onMissionChange('stats', next); }} fullWidth />
                    )}
                    <Box>
                      <Typography variant="caption" sx={{ display: 'block', mb: 0.5, color: 'rgba(255,255,255,0.7)' }}>Color</Typography>
                      <Button size="medium" variant="outlined" fullWidth onClick={(e) => { setMissionStatColorPickerIndex(idx); setMissionStatColorPickerAnchor(e.currentTarget); }} sx={{ borderColor: 'rgba(255,255,255,0.23)', color: 'rgba(255,255,255,0.9)', justifyContent: 'flex-start', height: 53.13, px: 1.5, '&:hover': { borderColor: 'rgba(255,255,255,0.87)' } }}>
                        <Box sx={{ width: 20, height: 20, borderRadius: 0.5, bgcolor: s.color || '#22C55E', border: '1px solid rgba(255,255,255,0.2)', mr: 1.5 }} />
                        {s.color || '#22C55E'}
                      </Button>
                    </Box>
                    <IconSelector label="Icon" value={(s.iconKey as ImpactIconKey) || ''} onChange={(iconKey) => { const next = [...mission.stats]; next[idx] = { ...s, iconKey: iconKey || null }; onMissionChange('stats', next); }} noneLabel="Default" />
                    {/* Only show delete button for non-special boxes */}
                    {!isSpecialBox && (
                      <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                        <IconButton onClick={() => { const next = mission.stats.filter((_, i) => i !== idx); onMissionChange('stats', next); }} color="error"><DeleteIcon /></IconButton>
                      </Box>
                    )}
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          );
        })}
        <Grid item xs={12}>
          <Button startIcon={<AddIcon />} variant="outlined" onClick={() => { const next = [...mission.stats, { id: uuidv4(), number: '', label: '', color: '#22C55E', action: 'none' as const, modalId: null, iconKey: null, numberSource: 'explicit' as MissionStatNumberSource }]; onMissionChange('stats', next); }}>
            Add Stat
          </Button>
        </Grid>

        {/* ========================================== */}
        {/* DISCIPLINES MODAL */}
        {/* ========================================== */}
        <Grid item xs={12}>
          <Divider sx={{ my: 1.5, bgcolor: 'rgba(255,255,255,0.08)' }} />
          <Typography variant="h6" sx={{ mb: 1.5 }}>
            Disciplines Modal
          </Typography>
        </Grid>
        <Grid item xs={12}>
          <CustomTextField
            label="Modal Title"
            value={mission.modalTitle || ''}
            onChange={(e) => onMissionChange('modalTitle', e.target.value)}
            fullWidth
            placeholder="Artistic Disciplines"
          />
        </Grid>
        <Grid item xs={12}>
          <Typography variant="subtitle2" sx={{ mb: 1 }}>Discipline Items</Typography>
          <Grid container spacing={2}>
            {mission.disciplinesItems.map((item, idx) => (
              <Grid item xs={12} key={idx}>
                <Card variant="outlined" sx={{ bgcolor: 'transparent' }}>
                  <CardContent sx={{ p: 1.5, '&:last-child': { pb: 1.5 } }}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, alignItems: 'stretch' }}>
                      <CustomTextField label="Name" size="small" value={item.name} onChange={(e) => { const next = [...mission.disciplinesItems]; next[idx] = { ...item, name: e.target.value }; onMissionChange('disciplinesItems', next); }} fullWidth />
                      <Box sx={{ width: '100%' }}>
                        <IconSelector value={(item.iconKey as ImpactIconKey) || ''} onChange={(iconKey) => { const next = [...mission.disciplinesItems]; next[idx] = { ...item, iconKey: iconKey || null }; onMissionChange('disciplinesItems', next); }} label="Icon" noneLabel="None" />
                      </Box>
                      <Box sx={{ alignSelf: 'flex-end' }}>
                        <IconButton size="small" color="error" onClick={() => { const next = mission.disciplinesItems.filter((_, i) => i !== idx); onMissionChange('disciplinesItems', next); }}><DeleteIcon fontSize="small" /></IconButton>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
            <Grid item xs={12}>
              <Button startIcon={<AddIcon />} variant="outlined" size="small" onClick={() => { const next = [...mission.disciplinesItems, { name: '', iconKey: null }]; onMissionChange('disciplinesItems', next); }}>
                Add Discipline
              </Button>
            </Grid>
          </Grid>
        </Grid>
      </Grid>

      {/* Color Picker Popovers */}
      <ColorPickerPopover
        open={missionPickerOpen}
        anchorEl={missionColorPickerAnchor}
        onClose={() => { setMissionColorPickerAnchor(null); setMissionColorPickerField(null); }}
        value={getCurrentMissionPickerColor()}
        onChange={handleColorChange}
        presets={defaultSwatch ?? undefined}
      />
      <ColorPickerPopover
        open={gradientPickerOpen}
        anchorEl={gradientPickerAnchor}
        onClose={() => { setGradientPickerAnchor(null); setGradientPickerKey(null); }}
        value={getGradientPickerColor()}
        onChange={handleGradientColorChange}
        presets={defaultSwatch ?? undefined}
      />
      <ColorPickerPopover
        open={missionStatPickerOpen}
        anchorEl={missionStatColorPickerAnchor}
        onClose={() => { setMissionStatColorPickerAnchor(null); setMissionStatColorPickerIndex(null); }}
        value={currentMissionStatPickerColor}
        onChange={(val) => {
          if (missionStatColorPickerIndex === null) return;
          const next = [...mission.stats];
          if (next[missionStatColorPickerIndex]) {
            next[missionStatColorPickerIndex] = { ...next[missionStatColorPickerIndex], color: val };
            onMissionChange('stats', next);
          }
        }}
        presets={defaultSwatch ?? undefined}
      />
    </Box>
  );
}

export default MissionTabEditor;
