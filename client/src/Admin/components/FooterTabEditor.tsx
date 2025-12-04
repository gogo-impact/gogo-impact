import React, { useState } from 'react';
import {
  Grid,
  Box,
  Typography,
  Button,
  Divider,
  IconButton,
  FormControlLabel,
  Switch,
  Slider,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';
import ColorPickerPopover from '../../components/ColorPickerPopover';
import { CustomTextField } from '../styles';
import { GradientEditor, parseGradientString, composeGradient } from './GradientEditor';
import { IconSelector } from '../../components/IconSelector';
import {
  FooterContent,
  FooterSocialLink,
  FooterColumn,
  FooterLinkItem,
  FooterBottomBar,
  FooterBottomLink,
  FooterNewsletter,
  FooterMailingAddress,
  FooterLogo,
} from '../../services/impact.api';
import { v4 as uuidv4 } from 'uuid';
import { normalizeUrl } from '../utils';

export interface FooterTabEditorProps {
  footer: FooterContent;
  defaultSwatch: string[] | null;
  onFooterChange: (field: keyof FooterContent, value: any) => void;
}

type ColorPickerField =
  | 'sectionBgColor'
  | 'descriptionColor'
  | 'socialBubbleBgColor'
  | 'socialBubbleHoverBgColor'
  | 'socialBubbleIconColor'
  | 'socialBubbleBorderColor'
  | 'columnTitleColor'
  | 'columnLinkColor'
  | 'columnLinkHoverColor'
  | 'bottomBar.copyrightColor'
  | 'bottomBar.bgColor'
  | 'bottomBar.borderColor'
  | 'bottomBar.linkColor'
  | 'bottomBar.linkHoverColor'
  | 'newsletter.titleColor'
  | 'newsletter.buttonBgColor'
  | 'newsletter.buttonTextColor'
  | 'newsletter.inputBgColor'
  | 'newsletter.inputBorderColor'
  | 'newsletter.inputTextColor'
  | 'mailingAddress.textColor';

export function FooterTabEditor({
  footer,
  defaultSwatch,
  onFooterChange,
}: FooterTabEditorProps) {
  const [colorPickerAnchor, setColorPickerAnchor] = useState<HTMLElement | null>(null);
  const [colorPickerField, setColorPickerField] = useState<ColorPickerField | null>(null);

  // Gradient picker state
  const [gradientPickerAnchor, setGradientPickerAnchor] = useState<HTMLElement | null>(null);
  const [gradientPickerKey, setGradientPickerKey] = useState<'sectionBgGradient' | 'topBorderGradient' | null>(null);
  const [gradientPickerColorIndex, setGradientPickerColorIndex] = useState<number>(0);
  const gradientPickerOpen = Boolean(gradientPickerAnchor);

  // Drag state for social links
  const [draggedSocialIndex, setDraggedSocialIndex] = useState<number | null>(null);
  const [dragOverSocialIndex, setDragOverSocialIndex] = useState<number | null>(null);

  // Drag state for columns
  const [draggedColumnIndex, setDraggedColumnIndex] = useState<number | null>(null);
  const [dragOverColumnIndex, setDragOverColumnIndex] = useState<number | null>(null);

  // Get nested objects with defaults
  const logo: FooterLogo = footer.logo ?? { imageUrl: '', alt: 'Logo', width: 180 };
  const socialLinks: FooterSocialLink[] = footer.socialLinks ?? [];
  const columns: FooterColumn[] = footer.columns ?? [];
  const bottomBar: FooterBottomBar = footer.bottomBar ?? {
    copyrightText: '© 2024 Guitars Over Guns. All rights reserved.',
    links: [],
  };
  const newsletter: FooterNewsletter = footer.newsletter ?? { enabled: false };
  const mailingAddress: FooterMailingAddress = footer.mailingAddress ?? { enabled: false };

  // Gradient helpers
  const getGradientValue = (key: 'sectionBgGradient' | 'topBorderGradient'): string => {
    if (key === 'sectionBgGradient') return footer.sectionBgGradient || '';
    if (key === 'topBorderGradient') return footer.topBorderGradient || '';
    return '';
  };

  const getGradientPickerColor = (): string => {
    if (!gradientPickerKey) return '#000000';
    const gradient = getGradientValue(gradientPickerKey);
    if (!gradient) return '#000000';
    const parsed = parseGradientString(gradient);
    return parsed.colors[gradientPickerColorIndex] || '#000000';
  };

  const openGradientPicker = (el: HTMLElement, key: 'sectionBgGradient' | 'topBorderGradient', colorIndex: number) => {
    setGradientPickerKey(key);
    setGradientPickerColorIndex(colorIndex);
    setGradientPickerAnchor(el);
  };

  const handleGradientColorChange = (color: string) => {
    if (!gradientPickerKey) return;
    const currentGradient = getGradientValue(gradientPickerKey);
    if (!currentGradient) {
      const newGradient = `linear-gradient(135deg, ${color}, ${color})`;
      onFooterChange(gradientPickerKey, newGradient);
      return;
    }
    const parsed = parseGradientString(currentGradient);
    const newColors = [...parsed.colors];
    newColors[gradientPickerColorIndex] = color;
    const newGradient = composeGradient(parsed.type, parsed.degree, newColors, parsed.opacity);
    onFooterChange(gradientPickerKey, newGradient);
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

    if (colorPickerField.startsWith('bottomBar.')) {
      const subField = colorPickerField.replace('bottomBar.', '') as keyof FooterBottomBar;
      onFooterChange('bottomBar', { ...bottomBar, [subField]: color });
    } else if (colorPickerField.startsWith('newsletter.')) {
      const subField = colorPickerField.replace('newsletter.', '') as keyof FooterNewsletter;
      onFooterChange('newsletter', { ...newsletter, [subField]: color });
    } else if (colorPickerField.startsWith('mailingAddress.')) {
      const subField = colorPickerField.replace('mailingAddress.', '') as keyof FooterMailingAddress;
      onFooterChange('mailingAddress', { ...mailingAddress, [subField]: color });
    } else {
      onFooterChange(colorPickerField as keyof FooterContent, color);
    }
  };

  const closeColorPicker = () => {
    setColorPickerAnchor(null);
    setColorPickerField(null);
  };

  const getColorValue = (field: ColorPickerField): string => {
    switch (field) {
      case 'sectionBgColor': return footer.sectionBgColor || '#121212';
      case 'descriptionColor': return footer.descriptionColor || '#94a3b8';
      case 'socialBubbleBgColor': return footer.socialBubbleBgColor || 'rgba(255,255,255,0.1)';
      case 'socialBubbleHoverBgColor': return footer.socialBubbleHoverBgColor || 'rgba(255,255,255,0.2)';
      case 'socialBubbleIconColor': return footer.socialBubbleIconColor || '#fff';
      case 'socialBubbleBorderColor': return footer.socialBubbleBorderColor || 'rgba(255,255,255,0.1)';
      case 'columnTitleColor': return footer.columnTitleColor || '#fff';
      case 'columnLinkColor': return footer.columnLinkColor || '#94a3b8';
      case 'columnLinkHoverColor': return footer.columnLinkHoverColor || '#fff';
      case 'bottomBar.copyrightColor': return bottomBar.copyrightColor || '#64748b';
      case 'bottomBar.bgColor': return bottomBar.bgColor || 'rgba(0,0,0,0.3)';
      case 'bottomBar.borderColor': return bottomBar.borderColor || 'rgba(255,255,255,0.05)';
      case 'bottomBar.linkColor': return bottomBar.linkColor || '#64748b';
      case 'bottomBar.linkHoverColor': return bottomBar.linkHoverColor || '#94a3b8';
      case 'newsletter.titleColor': return newsletter.titleColor || '#fff';
      case 'newsletter.buttonBgColor': return newsletter.buttonBgColor || '#1946F5';
      case 'newsletter.buttonTextColor': return newsletter.buttonTextColor || '#fff';
      case 'newsletter.inputBgColor': return newsletter.inputBgColor || 'rgba(255,255,255,0.05)';
      case 'newsletter.inputBorderColor': return newsletter.inputBorderColor || 'rgba(255,255,255,0.1)';
      case 'newsletter.inputTextColor': return newsletter.inputTextColor || '#fff';
      case 'mailingAddress.textColor': return mailingAddress.textColor || '#64748b';
      default: return '';
    }
  };

  // Logo helpers
  const updateLogo = (field: keyof FooterLogo, value: any) => {
    onFooterChange('logo', { ...logo, [field]: value });
  };

  // Social link CRUD
  const addSocialLink = () => {
    const newLink: FooterSocialLink = {
      id: uuidv4(),
      iconKey: 'facebook',
      url: '',
      label: 'New Link',
    };
    onFooterChange('socialLinks', [...socialLinks, newLink]);
  };

  const updateSocialLink = (index: number, field: keyof FooterSocialLink, value: any) => {
    const updated = [...socialLinks];
    if (field === 'url') {
      updated[index] = { ...updated[index], [field]: normalizeUrl(value) };
    } else {
      updated[index] = { ...updated[index], [field]: value };
    }
    onFooterChange('socialLinks', updated);
  };

  const removeSocialLink = (index: number) => {
    const updated = [...socialLinks];
    updated.splice(index, 1);
    onFooterChange('socialLinks', updated);
  };

  // Social link drag handlers
  const handleSocialDragStart = (index: number) => setDraggedSocialIndex(index);
  const handleSocialDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    setDragOverSocialIndex(index);
  };
  const handleSocialDrop = (index: number) => {
    if (draggedSocialIndex === null || draggedSocialIndex === index) {
      setDraggedSocialIndex(null);
      setDragOverSocialIndex(null);
      return;
    }
    const updated = [...socialLinks];
    const [removed] = updated.splice(draggedSocialIndex, 1);
    updated.splice(index, 0, removed);
    onFooterChange('socialLinks', updated);
    setDraggedSocialIndex(null);
    setDragOverSocialIndex(null);
  };

  // Column CRUD
  const addColumn = () => {
    const newColumn: FooterColumn = {
      id: uuidv4(),
      title: 'New Column',
      stackWithNext: false,
      links: [],
    };
    onFooterChange('columns', [...columns, newColumn]);
  };

  const updateColumn = (index: number, field: keyof FooterColumn, value: any) => {
    const updated = [...columns];
    updated[index] = { ...updated[index], [field]: value };
    onFooterChange('columns', updated);
  };

  const removeColumn = (index: number) => {
    const updated = [...columns];
    updated.splice(index, 1);
    onFooterChange('columns', updated);
  };

  // Column drag handlers
  const handleColumnDragStart = (index: number) => setDraggedColumnIndex(index);
  const handleColumnDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    setDragOverColumnIndex(index);
  };
  const handleColumnDrop = (index: number) => {
    if (draggedColumnIndex === null || draggedColumnIndex === index) {
      setDraggedColumnIndex(null);
      setDragOverColumnIndex(null);
      return;
    }
    const updated = [...columns];
    const [removed] = updated.splice(draggedColumnIndex, 1);
    updated.splice(index, 0, removed);
    onFooterChange('columns', updated);
    setDraggedColumnIndex(null);
    setDragOverColumnIndex(null);
  };

  // Column link CRUD
  const addColumnLink = (columnIndex: number) => {
    const newLink: FooterLinkItem = {
      id: uuidv4(),
      label: 'New Link',
      url: '',
    };
    const updated = [...columns];
    updated[columnIndex] = {
      ...updated[columnIndex],
      links: [...updated[columnIndex].links, newLink],
    };
    onFooterChange('columns', updated);
  };

  const updateColumnLink = (columnIndex: number, linkIndex: number, field: keyof FooterLinkItem, value: any) => {
    const updated = [...columns];
    const links = [...updated[columnIndex].links];
    if (field === 'url') {
      links[linkIndex] = { ...links[linkIndex], [field]: normalizeUrl(value) };
    } else {
      links[linkIndex] = { ...links[linkIndex], [field]: value };
    }
    updated[columnIndex] = { ...updated[columnIndex], links };
    onFooterChange('columns', updated);
  };

  const removeColumnLink = (columnIndex: number, linkIndex: number) => {
    const updated = [...columns];
    const links = [...updated[columnIndex].links];
    links.splice(linkIndex, 1);
    updated[columnIndex] = { ...updated[columnIndex], links };
    onFooterChange('columns', updated);
  };

  // Bottom bar helpers
  const updateBottomBar = (field: keyof FooterBottomBar, value: any) => {
    onFooterChange('bottomBar', { ...bottomBar, [field]: value });
  };

  // Bottom bar link CRUD
  const addBottomBarLink = () => {
    const newLink: FooterBottomLink = {
      id: uuidv4(),
      label: 'New Link',
      url: '',
    };
    updateBottomBar('links', [...bottomBar.links, newLink]);
  };

  const updateBottomBarLink = (index: number, field: keyof FooterBottomLink, value: any) => {
    const updated = [...bottomBar.links];
    if (field === 'url') {
      updated[index] = { ...updated[index], [field]: normalizeUrl(value) };
    } else {
      updated[index] = { ...updated[index], [field]: value };
    }
    updateBottomBar('links', updated);
  };

  const removeBottomBarLink = (index: number) => {
    const updated = [...bottomBar.links];
    updated.splice(index, 1);
    updateBottomBar('links', updated);
  };

  // Newsletter helpers
  const updateNewsletter = (field: keyof FooterNewsletter, value: any) => {
    onFooterChange('newsletter', { ...newsletter, [field]: value });
  };

  // Mailing address helpers
  const updateMailingAddress = (field: keyof FooterMailingAddress, value: any) => {
    onFooterChange('mailingAddress', { ...mailingAddress, [field]: value });
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
      {/* SECTION SETTINGS */}
      {/* ─────────────────────────────────────────────────────────────────────── */}
      <Grid item xs={12}>
        <Typography variant="h6" sx={{ mb: 2, color: 'rgba(255,255,255,0.9)' }}>
          Section Settings
        </Typography>
        <FormControlLabel
          control={
            <Switch
              checked={footer.visible !== false}
              onChange={(e) => onFooterChange('visible', e.target.checked)}
            />
          }
          label="Footer visible"
        />
      </Grid>

      {/* ─────────────────────────────────────────────────────────────────────── */}
      {/* SECTION BACKGROUND */}
      {/* ─────────────────────────────────────────────────────────────────────── */}
      <Grid item xs={12}>
        <Divider sx={{ my: 2, bgcolor: 'rgba(255,255,255,0.1)' }} />
        <Typography variant="h6" sx={{ mb: 2, color: 'rgba(255,255,255,0.9)' }}>
          Section Background
        </Typography>
      </Grid>

      <Grid item xs={12}>
        <GradientEditor
          label="Section Background Gradient"
          value={footer.sectionBgGradient || ''}
          onChange={(val) => onFooterChange('sectionBgGradient', val)}
          onPickColor={(el, idx) => openGradientPicker(el, 'sectionBgGradient', idx)}
        />
      </Grid>

      <Grid item xs={12}>
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <Button
            size="small"
            variant="outlined"
            onClick={(e) => openColorPicker(e.currentTarget, 'sectionBgColor')}
            sx={{ borderColor: 'rgba(255,255,255,0.3)', color: 'rgba(255,255,255,0.9)' }}
          >
            <span style={{ display: 'inline-block', width: 16, height: 16, borderRadius: 3, background: footer.sectionBgColor || '#121212', border: '1px solid rgba(255,255,255,0.2)' }} />
            &nbsp;Background Color (fallback)
          </Button>
        </Box>
      </Grid>

      <Grid item xs={12}>
        <GradientEditor
          label="Top Border Gradient"
          value={footer.topBorderGradient || ''}
          onChange={(val) => onFooterChange('topBorderGradient', val)}
          onPickColor={(el, idx) => openGradientPicker(el, 'topBorderGradient', idx)}
        />
      </Grid>

      {/* ─────────────────────────────────────────────────────────────────────── */}
      {/* LOGO & BRANDING */}
      {/* ─────────────────────────────────────────────────────────────────────── */}
      <Grid item xs={12}>
        <Divider sx={{ my: 2, bgcolor: 'rgba(255,255,255,0.1)' }} />
        <Typography variant="h6" sx={{ mb: 2, color: 'rgba(255,255,255,0.9)' }}>
          Logo & Branding
        </Typography>
      </Grid>

      <Grid item xs={12} md={8}>
        <CustomTextField
          fullWidth
          label="Logo Image URL"
          value={logo.imageUrl || ''}
          onChange={(e) => updateLogo('imageUrl', e.target.value)}
        />
      </Grid>

      <Grid item xs={12} md={4}>
        <CustomTextField
          fullWidth
          label="Logo Width (px)"
          type="number"
          value={logo.width || 180}
          onChange={(e) => updateLogo('width', parseInt(e.target.value) || 180)}
        />
      </Grid>

      <Grid item xs={12}>
        <CustomTextField
          fullWidth
          label="Logo Alt Text"
          value={logo.alt || ''}
          onChange={(e) => updateLogo('alt', e.target.value)}
        />
      </Grid>

      <Grid item xs={12}>
        <CustomTextField
          fullWidth
          multiline
          minRows={2}
          label="Description"
          value={footer.description || ''}
          onChange={(e) => onFooterChange('description', e.target.value)}
        />
      </Grid>

      <Grid item xs={12}>
        <Button
          size="small"
          variant="outlined"
          onClick={(e) => openColorPicker(e.currentTarget, 'descriptionColor')}
          sx={{ borderColor: 'rgba(255,255,255,0.3)', color: 'rgba(255,255,255,0.9)' }}
        >
          <span style={{ display: 'inline-block', width: 16, height: 16, borderRadius: 3, background: footer.descriptionColor || '#94a3b8', border: '1px solid rgba(255,255,255,0.2)' }} />
          &nbsp;Description color
        </Button>
      </Grid>

      {/* ─────────────────────────────────────────────────────────────────────── */}
      {/* SOCIAL LINKS */}
      {/* ─────────────────────────────────────────────────────────────────────── */}
      <Grid item xs={12}>
        <Divider sx={{ my: 2, bgcolor: 'rgba(255,255,255,0.1)' }} />
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
          <Typography variant="h6" sx={{ color: 'rgba(255,255,255,0.9)' }}>
            Social Links ({socialLinks.length})
          </Typography>
          <Button startIcon={<AddIcon />} variant="outlined" size="small" onClick={addSocialLink}>
            Add Social Link
          </Button>
        </Box>
      </Grid>

      <Grid item xs={12}>
        {socialLinks.map((link, index) => (
          <Box
            key={link.id}
            draggable
            onDragStart={() => handleSocialDragStart(index)}
            onDragOver={(e) => handleSocialDragOver(e, index)}
            onDrop={() => handleSocialDrop(index)}
            onDragEnd={() => {
              setDraggedSocialIndex(null);
              setDragOverSocialIndex(null);
            }}
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              p: 1.5,
              mb: 1,
              borderRadius: 1,
              backgroundColor: dragOverSocialIndex === index ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.02)',
              border: '1px solid',
              borderColor: dragOverSocialIndex === index ? 'primary.main' : 'rgba(255,255,255,0.1)',
              '&:hover': { borderColor: 'rgba(255,255,255,0.2)' },
            }}
          >
            <DragIndicatorIcon sx={{ cursor: 'grab', color: 'rgba(255,255,255,0.4)', fontSize: 20 }} />
            <Box sx={{ flex: 1, minWidth: 120 }}>
              <IconSelector
                label="Icon"
                value={link.iconKey}
                onChange={(key) => updateSocialLink(index, 'iconKey', key)}
                allowNone={false}
              />
            </Box>
            <CustomTextField
              size="small"
              label="Label"
              value={link.label}
              onChange={(e) => updateSocialLink(index, 'label', e.target.value)}
              sx={{ flex: 1 }}
            />
            <CustomTextField
              size="small"
              label="URL"
              value={link.url}
              onChange={(e) => updateSocialLink(index, 'url', e.target.value)}
              sx={{ flex: 2 }}
            />
            <IconButton color="error" size="small" onClick={() => removeSocialLink(index)}>
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Box>
        ))}
      </Grid>

      <Grid item xs={12}>
        <Typography variant="subtitle2" sx={{ mb: 1, color: 'rgba(255,255,255,0.7)' }}>
          Social Bubble Styling
        </Typography>
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <Button
            size="small"
            variant="outlined"
            onClick={(e) => openColorPicker(e.currentTarget, 'socialBubbleBgColor')}
            sx={{ borderColor: 'rgba(255,255,255,0.3)', color: 'rgba(255,255,255,0.9)' }}
          >
            <span style={{ display: 'inline-block', width: 16, height: 16, borderRadius: 3, background: footer.socialBubbleBgColor || 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)' }} />
            &nbsp;Background
          </Button>
          <Button
            size="small"
            variant="outlined"
            onClick={(e) => openColorPicker(e.currentTarget, 'socialBubbleHoverBgColor')}
            sx={{ borderColor: 'rgba(255,255,255,0.3)', color: 'rgba(255,255,255,0.9)' }}
          >
            <span style={{ display: 'inline-block', width: 16, height: 16, borderRadius: 3, background: footer.socialBubbleHoverBgColor || 'rgba(255,255,255,0.2)', border: '1px solid rgba(255,255,255,0.2)' }} />
            &nbsp;Hover BG
          </Button>
          <Button
            size="small"
            variant="outlined"
            onClick={(e) => openColorPicker(e.currentTarget, 'socialBubbleIconColor')}
            sx={{ borderColor: 'rgba(255,255,255,0.3)', color: 'rgba(255,255,255,0.9)' }}
          >
            <span style={{ display: 'inline-block', width: 16, height: 16, borderRadius: 3, background: footer.socialBubbleIconColor || '#fff', border: '1px solid rgba(255,255,255,0.2)' }} />
            &nbsp;Icon color
          </Button>
          <Button
            size="small"
            variant="outlined"
            onClick={(e) => openColorPicker(e.currentTarget, 'socialBubbleBorderColor')}
            sx={{ borderColor: 'rgba(255,255,255,0.3)', color: 'rgba(255,255,255,0.9)' }}
          >
            <span style={{ display: 'inline-block', width: 16, height: 16, borderRadius: 3, background: footer.socialBubbleBorderColor || 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)' }} />
            &nbsp;Border
          </Button>
        </Box>
      </Grid>

      {/* ─────────────────────────────────────────────────────────────────────── */}
      {/* LINK COLUMNS */}
      {/* ─────────────────────────────────────────────────────────────────────── */}
      <Grid item xs={12}>
        <Divider sx={{ my: 2, bgcolor: 'rgba(255,255,255,0.1)' }} />
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
          <Typography variant="h6" sx={{ color: 'rgba(255,255,255,0.9)' }}>
            Link Columns ({columns.length})
          </Typography>
          <Button startIcon={<AddIcon />} variant="outlined" size="small" onClick={addColumn}>
            Add Column
          </Button>
        </Box>
      </Grid>

      <Grid item xs={12}>
        <Typography variant="subtitle2" sx={{ mb: 1, color: 'rgba(255,255,255,0.7)' }}>
          Column Styling
        </Typography>
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mb: 2 }}>
          <Button
            size="small"
            variant="outlined"
            onClick={(e) => openColorPicker(e.currentTarget, 'columnTitleColor')}
            sx={{ borderColor: 'rgba(255,255,255,0.3)', color: 'rgba(255,255,255,0.9)' }}
          >
            <span style={{ display: 'inline-block', width: 16, height: 16, borderRadius: 3, background: footer.columnTitleColor || '#fff', border: '1px solid rgba(255,255,255,0.2)' }} />
            &nbsp;Title color
          </Button>
          <Button
            size="small"
            variant="outlined"
            onClick={(e) => openColorPicker(e.currentTarget, 'columnLinkColor')}
            sx={{ borderColor: 'rgba(255,255,255,0.3)', color: 'rgba(255,255,255,0.9)' }}
          >
            <span style={{ display: 'inline-block', width: 16, height: 16, borderRadius: 3, background: footer.columnLinkColor || '#94a3b8', border: '1px solid rgba(255,255,255,0.2)' }} />
            &nbsp;Link color
          </Button>
          <Button
            size="small"
            variant="outlined"
            onClick={(e) => openColorPicker(e.currentTarget, 'columnLinkHoverColor')}
            sx={{ borderColor: 'rgba(255,255,255,0.3)', color: 'rgba(255,255,255,0.9)' }}
          >
            <span style={{ display: 'inline-block', width: 16, height: 16, borderRadius: 3, background: footer.columnLinkHoverColor || '#fff', border: '1px solid rgba(255,255,255,0.2)' }} />
            &nbsp;Link hover
          </Button>
        </Box>
      </Grid>

      <Grid item xs={12}>
        {columns.map((column, columnIndex) => (
          <Box
            key={column.id}
            draggable
            onDragStart={() => handleColumnDragStart(columnIndex)}
            onDragOver={(e) => handleColumnDragOver(e, columnIndex)}
            onDrop={() => handleColumnDrop(columnIndex)}
            onDragEnd={() => {
              setDraggedColumnIndex(null);
              setDragOverColumnIndex(null);
            }}
            sx={{
              p: 2,
              mb: 2,
              borderRadius: 1,
              backgroundColor: dragOverColumnIndex === columnIndex ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.02)',
              border: '1px solid',
              borderColor: dragOverColumnIndex === columnIndex ? 'primary.main' : 'rgba(255,255,255,0.1)',
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
              <DragIndicatorIcon sx={{ cursor: 'grab', color: 'rgba(255,255,255,0.4)', fontSize: 20 }} />
              <CustomTextField
                size="small"
                label="Column Title"
                value={column.title}
                onChange={(e) => updateColumn(columnIndex, 'title', e.target.value)}
                sx={{ flex: 1 }}
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={column.stackWithNext}
                    onChange={(e) => updateColumn(columnIndex, 'stackWithNext', e.target.checked)}
                    size="small"
                  />
                }
                label="Stack with next"
                sx={{ ml: 1, '& .MuiTypography-root': { fontSize: '0.8rem' } }}
              />
              <IconButton color="error" size="small" onClick={() => removeColumn(columnIndex)}>
                <DeleteIcon fontSize="small" />
              </IconButton>
            </Box>

            <Typography variant="body2" sx={{ mb: 1, color: 'rgba(255,255,255,0.6)' }}>
              Links ({column.links.length})
            </Typography>

            {column.links.map((link, linkIndex) => (
              <Box key={link.id} sx={{ display: 'flex', gap: 1, mb: 1, pl: 3 }}>
                <CustomTextField
                  size="small"
                  label="Label"
                  value={link.label}
                  onChange={(e) => updateColumnLink(columnIndex, linkIndex, 'label', e.target.value)}
                  sx={{ flex: 1 }}
                />
                <CustomTextField
                  size="small"
                  label="URL"
                  value={link.url}
                  onChange={(e) => updateColumnLink(columnIndex, linkIndex, 'url', e.target.value)}
                  sx={{ flex: 2 }}
                />
                <IconButton color="error" size="small" onClick={() => removeColumnLink(columnIndex, linkIndex)}>
                  <DeleteIcon fontSize="small" />
                </IconButton>
              </Box>
            ))}

            <Button
              size="small"
              startIcon={<AddIcon />}
              onClick={() => addColumnLink(columnIndex)}
              sx={{ ml: 3, mt: 1 }}
            >
              Add Link
            </Button>
          </Box>
        ))}
      </Grid>

      {/* ─────────────────────────────────────────────────────────────────────── */}
      {/* BOTTOM BAR */}
      {/* ─────────────────────────────────────────────────────────────────────── */}
      <Grid item xs={12}>
        <Divider sx={{ my: 2, bgcolor: 'rgba(255,255,255,0.1)' }} />
        <Typography variant="h6" sx={{ mb: 2, color: 'rgba(255,255,255,0.9)' }}>
          Bottom Bar
        </Typography>
      </Grid>

      <Grid item xs={12}>
        <CustomTextField
          fullWidth
          label="Copyright Text"
          value={bottomBar.copyrightText}
          onChange={(e) => updateBottomBar('copyrightText', e.target.value)}
        />
      </Grid>

      <Grid item xs={12} md={4}>
        <CustomTextField
          fullWidth
          label="Link Separator"
          value={bottomBar.linkSeparator || '|'}
          onChange={(e) => updateBottomBar('linkSeparator', e.target.value)}
        />
      </Grid>

      <Grid item xs={12}>
        <Typography variant="subtitle2" sx={{ mb: 1, color: 'rgba(255,255,255,0.7)' }}>
          Bottom Bar Styling
        </Typography>
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mb: 2 }}>
          <Button
            size="small"
            variant="outlined"
            onClick={(e) => openColorPicker(e.currentTarget, 'bottomBar.copyrightColor')}
            sx={{ borderColor: 'rgba(255,255,255,0.3)', color: 'rgba(255,255,255,0.9)' }}
          >
            <span style={{ display: 'inline-block', width: 16, height: 16, borderRadius: 3, background: bottomBar.copyrightColor || '#64748b', border: '1px solid rgba(255,255,255,0.2)' }} />
            &nbsp;Copyright color
          </Button>
          <Button
            size="small"
            variant="outlined"
            onClick={(e) => openColorPicker(e.currentTarget, 'bottomBar.bgColor')}
            sx={{ borderColor: 'rgba(255,255,255,0.3)', color: 'rgba(255,255,255,0.9)' }}
          >
            <span style={{ display: 'inline-block', width: 16, height: 16, borderRadius: 3, background: bottomBar.bgColor || 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.2)' }} />
            &nbsp;Background
          </Button>
          <Button
            size="small"
            variant="outlined"
            onClick={(e) => openColorPicker(e.currentTarget, 'bottomBar.borderColor')}
            sx={{ borderColor: 'rgba(255,255,255,0.3)', color: 'rgba(255,255,255,0.9)' }}
          >
            <span style={{ display: 'inline-block', width: 16, height: 16, borderRadius: 3, background: bottomBar.borderColor || 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.2)' }} />
            &nbsp;Border
          </Button>
          <Button
            size="small"
            variant="outlined"
            onClick={(e) => openColorPicker(e.currentTarget, 'bottomBar.linkColor')}
            sx={{ borderColor: 'rgba(255,255,255,0.3)', color: 'rgba(255,255,255,0.9)' }}
          >
            <span style={{ display: 'inline-block', width: 16, height: 16, borderRadius: 3, background: bottomBar.linkColor || '#64748b', border: '1px solid rgba(255,255,255,0.2)' }} />
            &nbsp;Link color
          </Button>
          <Button
            size="small"
            variant="outlined"
            onClick={(e) => openColorPicker(e.currentTarget, 'bottomBar.linkHoverColor')}
            sx={{ borderColor: 'rgba(255,255,255,0.3)', color: 'rgba(255,255,255,0.9)' }}
          >
            <span style={{ display: 'inline-block', width: 16, height: 16, borderRadius: 3, background: bottomBar.linkHoverColor || '#94a3b8', border: '1px solid rgba(255,255,255,0.2)' }} />
            &nbsp;Link hover
          </Button>
        </Box>
      </Grid>

      <Grid item xs={12}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
          <Typography variant="subtitle2" sx={{ color: 'rgba(255,255,255,0.7)' }}>
            Legal Links ({bottomBar.links.length})
          </Typography>
          <Button size="small" startIcon={<AddIcon />} onClick={addBottomBarLink}>
            Add Link
          </Button>
        </Box>
        {bottomBar.links.map((link, index) => (
          <Box key={link.id} sx={{ display: 'flex', gap: 1, mb: 1 }}>
            <CustomTextField
              size="small"
              label="Label"
              value={link.label}
              onChange={(e) => updateBottomBarLink(index, 'label', e.target.value)}
              sx={{ flex: 1 }}
            />
            <CustomTextField
              size="small"
              label="URL"
              value={link.url}
              onChange={(e) => updateBottomBarLink(index, 'url', e.target.value)}
              sx={{ flex: 2 }}
            />
            <IconButton color="error" size="small" onClick={() => removeBottomBarLink(index)}>
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Box>
        ))}
      </Grid>

      {/* ─────────────────────────────────────────────────────────────────────── */}
      {/* NEWSLETTER (OPTIONAL) */}
      {/* ─────────────────────────────────────────────────────────────────────── */}
      <Grid item xs={12}>
        <Divider sx={{ my: 2, bgcolor: 'rgba(255,255,255,0.1)' }} />
        <Typography variant="h6" sx={{ mb: 1, color: 'rgba(255,255,255,0.9)' }}>
          Newsletter Signup (Optional)
        </Typography>
      </Grid>

      <Grid item xs={12}>
        <FormControlLabel
          control={
            <Switch
              checked={newsletter.enabled}
              onChange={(e) => updateNewsletter('enabled', e.target.checked)}
            />
          }
          label="Enable newsletter signup"
        />
      </Grid>

      {newsletter.enabled && (
        <>
          <Grid item xs={12} md={6}>
            <CustomTextField
              fullWidth
              label="Title"
              value={newsletter.title || 'Join Our Newsletter'}
              onChange={(e) => updateNewsletter('title', e.target.value)}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <CustomTextField
              fullWidth
              label="Button Text"
              value={newsletter.buttonText || 'Sign Up'}
              onChange={(e) => updateNewsletter('buttonText', e.target.value)}
            />
          </Grid>
          <Grid item xs={12}>
            <CustomTextField
              fullWidth
              label="Input Placeholder"
              value={newsletter.placeholder || 'Enter your email'}
              onChange={(e) => updateNewsletter('placeholder', e.target.value)}
            />
          </Grid>
          <Grid item xs={12}>
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
              <Button
                size="small"
                variant="outlined"
                onClick={(e) => openColorPicker(e.currentTarget, 'newsletter.titleColor')}
                sx={{ borderColor: 'rgba(255,255,255,0.3)', color: 'rgba(255,255,255,0.9)' }}
              >
                <span style={{ display: 'inline-block', width: 16, height: 16, borderRadius: 3, background: newsletter.titleColor || '#fff', border: '1px solid rgba(255,255,255,0.2)' }} />
                &nbsp;Title color
              </Button>
              <Button
                size="small"
                variant="outlined"
                onClick={(e) => openColorPicker(e.currentTarget, 'newsletter.buttonBgColor')}
                sx={{ borderColor: 'rgba(255,255,255,0.3)', color: 'rgba(255,255,255,0.9)' }}
              >
                <span style={{ display: 'inline-block', width: 16, height: 16, borderRadius: 3, background: newsletter.buttonBgColor || '#1946F5', border: '1px solid rgba(255,255,255,0.2)' }} />
                &nbsp;Button BG
              </Button>
              <Button
                size="small"
                variant="outlined"
                onClick={(e) => openColorPicker(e.currentTarget, 'newsletter.buttonTextColor')}
                sx={{ borderColor: 'rgba(255,255,255,0.3)', color: 'rgba(255,255,255,0.9)' }}
              >
                <span style={{ display: 'inline-block', width: 16, height: 16, borderRadius: 3, background: newsletter.buttonTextColor || '#fff', border: '1px solid rgba(255,255,255,0.2)' }} />
                &nbsp;Button text
              </Button>
              <Button
                size="small"
                variant="outlined"
                onClick={(e) => openColorPicker(e.currentTarget, 'newsletter.inputBgColor')}
                sx={{ borderColor: 'rgba(255,255,255,0.3)', color: 'rgba(255,255,255,0.9)' }}
              >
                <span style={{ display: 'inline-block', width: 16, height: 16, borderRadius: 3, background: newsletter.inputBgColor || 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.2)' }} />
                &nbsp;Input BG
              </Button>
            </Box>
          </Grid>
        </>
      )}

      {/* ─────────────────────────────────────────────────────────────────────── */}
      {/* MAILING ADDRESS (OPTIONAL) */}
      {/* ─────────────────────────────────────────────────────────────────────── */}
      <Grid item xs={12}>
        <Divider sx={{ my: 2, bgcolor: 'rgba(255,255,255,0.1)' }} />
        <Typography variant="h6" sx={{ mb: 1, color: 'rgba(255,255,255,0.9)' }}>
          Mailing Address (Optional)
        </Typography>
      </Grid>

      <Grid item xs={12}>
        <FormControlLabel
          control={
            <Switch
              checked={mailingAddress.enabled}
              onChange={(e) => updateMailingAddress('enabled', e.target.checked)}
            />
          }
          label="Show mailing address"
        />
      </Grid>

      {mailingAddress.enabled && (
        <>
          <Grid item xs={12}>
            <CustomTextField
              fullWidth
              multiline
              minRows={3}
              label="Address (use newlines)"
              value={mailingAddress.text || ''}
              onChange={(e) => updateMailingAddress('text', e.target.value)}
              helperText="Use newlines for multi-line address"
            />
          </Grid>
          <Grid item xs={12}>
            <Button
              size="small"
              variant="outlined"
              onClick={(e) => openColorPicker(e.currentTarget, 'mailingAddress.textColor')}
              sx={{ borderColor: 'rgba(255,255,255,0.3)', color: 'rgba(255,255,255,0.9)' }}
            >
              <span style={{ display: 'inline-block', width: 16, height: 16, borderRadius: 3, background: mailingAddress.textColor || '#64748b', border: '1px solid rgba(255,255,255,0.2)' }} />
              &nbsp;Text color
            </Button>
          </Grid>
        </>
      )}
    </Grid>
  );
}

export default FooterTabEditor;

