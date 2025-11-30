import React, { useState } from 'react';
import {
  Grid,
  Box,
  Typography,
  Button,
  Divider,
  IconButton,
  TextField,
  Autocomplete,
  CircularProgress,
  Chip,
  Switch,
  FormControlLabel,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Collapse,
  Paper,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import ColorPickerPopover from '../../components/ColorPickerPopover';
import { CustomTextField } from '../styles';
import {
  NationalImpactContent,
  MapRegion,
  MapLocation,
  MapLocationType,
  validateAddress,
} from '../../services/impact.api';

export interface NationalImpactTabEditorProps {
  nationalImpact: NationalImpactContent;
  defaultSwatch: string[] | null;
  onNationalImpactChange: (field: keyof NationalImpactContent, value: unknown) => void;
}

type NationalImpactColorField =
  | 'titleColor'
  | 'sectionBgColor'
  | 'overlayButtonBgColor'
  | 'overlayButtonHoverBgColor';

const LOCATION_TYPES: { value: MapLocationType; label: string }[] = [
  { value: 'default', label: 'Default Pin' },
  { value: 'school', label: 'School' },
  { value: 'academy', label: 'Academy' },
  { value: 'community-center', label: 'Community Center' },
  { value: 'studio', label: 'Studio' },
  { value: 'hub', label: 'Hub' },
  { value: 'program', label: 'Program' },
  { value: 'office', label: 'Office' },
  { value: 'summer-program', label: 'Summer Program' },
  { value: 'performance-venue', label: 'Performance Venue' },
];

export function NationalImpactTabEditor({
  nationalImpact,
  defaultSwatch,
  onNationalImpactChange,
}: NationalImpactTabEditorProps) {
  const [colorPickerAnchor, setColorPickerAnchor] = useState<HTMLElement | null>(null);
  const [colorPickerField, setColorPickerField] = useState<NationalImpactColorField | null>(null);
  const [regionColorAnchor, setRegionColorAnchor] = useState<HTMLElement | null>(null);
  const [regionColorIndex, setRegionColorIndex] = useState<number | null>(null);

  // Expanded regions state
  const [expandedRegions, setExpandedRegions] = useState<Record<string, boolean>>({});

  // Address validation state
  const [validatingAddress, setValidatingAddress] = useState<string | null>(null);
  const [addressError, setAddressError] = useState<Record<string, string>>({});

  const regions: MapRegion[] = nationalImpact.regions ?? [];

  // Color picker helpers
  const openColorPicker = (el: HTMLElement, field: NationalImpactColorField) => {
    setColorPickerField(field);
    setColorPickerAnchor(el);
  };

  const handleColorChange = (color: string) => {
    if (colorPickerField) {
      onNationalImpactChange(colorPickerField, color);
    }
  };

  const closeColorPicker = () => {
    setColorPickerAnchor(null);
    setColorPickerField(null);
  };

  const getColorValue = (field: NationalImpactColorField): string => {
    return (nationalImpact[field] as string) || '';
  };

  // Region color picker
  const openRegionColorPicker = (el: HTMLElement, index: number) => {
    setRegionColorIndex(index);
    setRegionColorAnchor(el);
  };

  const handleRegionColorChange = (color: string) => {
    if (regionColorIndex !== null) {
      const updated = [...regions];
      updated[regionColorIndex] = { ...updated[regionColorIndex], color };
      onNationalImpactChange('regions', updated);
    }
  };

  const closeRegionColorPicker = () => {
    setRegionColorAnchor(null);
    setRegionColorIndex(null);
  };

  // Toggle region expansion
  const toggleRegion = (regionId: string) => {
    setExpandedRegions((prev) => ({ ...prev, [regionId]: !prev[regionId] }));
  };

  // Region CRUD
  const addRegion = () => {
    const newRegion: MapRegion = {
      id: `region-${Date.now()}`,
      name: '',
      color: '#00D4FF',
      locations: [],
    };
    onNationalImpactChange('regions', [...regions, newRegion]);
    setExpandedRegions((prev) => ({ ...prev, [newRegion.id]: true }));
  };

  const updateRegion = (index: number, field: keyof MapRegion, value: unknown) => {
    const updated = [...regions];
    updated[index] = { ...updated[index], [field]: value };
    onNationalImpactChange('regions', updated);
  };

  const removeRegion = (index: number) => {
    const updated = regions.filter((_, i) => i !== index);
    onNationalImpactChange('regions', updated);
  };

  // Location CRUD
  const addLocation = (regionIndex: number) => {
    const updated = [...regions];
    const newLocation: MapLocation = {
      id: `loc-${Date.now()}`,
      name: '',
      address: '',
      coordinates: [0, 0],
      showAddress: true,
      type: 'default',
      description: null,
      website: null,
    };
    updated[regionIndex] = {
      ...updated[regionIndex],
      locations: [...updated[regionIndex].locations, newLocation],
    };
    onNationalImpactChange('regions', updated);
  };

  const updateLocation = (
    regionIndex: number,
    locationIndex: number,
    field: keyof MapLocation,
    value: unknown
  ) => {
    const updated = [...regions];
    const locations = [...updated[regionIndex].locations];
    locations[locationIndex] = { ...locations[locationIndex], [field]: value };
    updated[regionIndex] = { ...updated[regionIndex], locations };
    onNationalImpactChange('regions', updated);
  };

  const removeLocation = (regionIndex: number, locationIndex: number) => {
    const updated = [...regions];
    const locations = updated[regionIndex].locations.filter((_, i) => i !== locationIndex);
    updated[regionIndex] = { ...updated[regionIndex], locations };
    onNationalImpactChange('regions', updated);
  };

  // Address validation
  const handleValidateAddress = async (
    regionIndex: number,
    locationIndex: number,
    address: string
  ) => {
    const locationKey = `${regionIndex}-${locationIndex}`;
    if (!address.trim()) {
      setAddressError((prev) => ({ ...prev, [locationKey]: 'Address is required' }));
      return;
    }

    setValidatingAddress(locationKey);
    setAddressError((prev) => {
      const next = { ...prev };
      delete next[locationKey];
      return next;
    });

    try {
      const result = await validateAddress(address);
      if (result.valid && result.formattedAddress && result.coordinates) {
        // Update both address and coordinates
        const updated = [...regions];
        const locations = [...updated[regionIndex].locations];
        locations[locationIndex] = {
          ...locations[locationIndex],
          address: result.formattedAddress,
          coordinates: result.coordinates,
        };
        updated[regionIndex] = { ...updated[regionIndex], locations };
        onNationalImpactChange('regions', updated);
      } else {
        setAddressError((prev) => ({
          ...prev,
          [locationKey]: result.error || 'Could not validate address',
        }));
      }
    } catch (error) {
      setAddressError((prev) => ({
        ...prev,
        [locationKey]: 'Failed to validate address',
      }));
    } finally {
      setValidatingAddress(null);
    }
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

      {/* Region Color Picker Popover */}
      <ColorPickerPopover
        open={Boolean(regionColorAnchor)}
        anchorEl={regionColorAnchor}
        color={regionColorIndex !== null ? regions[regionColorIndex]?.color || '' : ''}
        onChange={handleRegionColorChange}
        onClose={closeRegionColorPicker}
        swatches={defaultSwatch ?? undefined}
      />

      {/* ─────────────────────────────────────────────────────────────────────── */}
      {/* SECTION HEADER */}
      {/* ─────────────────────────────────────────────────────────────────────── */}
      <Grid item xs={12}>
        <Typography variant="h6" sx={{ mb: 2, color: 'rgba(255,255,255,0.9)' }}>
          Section Header
        </Typography>
      </Grid>

      <Grid item xs={12} md={6}>
        <CustomTextField
          label="Title"
          value={nationalImpact.title || ''}
          onChange={(e) => onNationalImpactChange('title', e.target.value)}
          fullWidth
          placeholder="e.g., Our National Impact"
        />
      </Grid>

      <Grid item xs={12} md={6}>
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mt: 1 }}>
          <Button
            size="small"
            variant="outlined"
            onClick={(e) => openColorPicker(e.currentTarget, 'titleColor')}
            sx={{ borderColor: 'rgba(255,255,255,0.3)', color: 'rgba(255,255,255,0.9)' }}
          >
            <span style={{ display: 'inline-block', width: 16, height: 16, borderRadius: 3, background: nationalImpact.titleColor || 'transparent', border: '1px solid rgba(255,255,255,0.2)' }} />
            &nbsp;Title color
          </Button>
          <Button
            size="small"
            variant="outlined"
            onClick={(e) => openColorPicker(e.currentTarget, 'sectionBgColor')}
            sx={{ borderColor: 'rgba(255,255,255,0.3)', color: 'rgba(255,255,255,0.9)' }}
          >
            <span style={{ display: 'inline-block', width: 16, height: 16, borderRadius: 3, background: nationalImpact.sectionBgColor || 'transparent', border: '1px solid rgba(255,255,255,0.2)' }} />
            &nbsp;Section bg
          </Button>
        </Box>
      </Grid>

      {/* ─────────────────────────────────────────────────────────────────────── */}
      {/* OVERLAY BUTTON */}
      {/* ─────────────────────────────────────────────────────────────────────── */}
      <Grid item xs={12}>
        <Divider sx={{ my: 2, bgcolor: 'rgba(255,255,255,0.1)' }} />
        <Typography variant="h6" sx={{ mb: 2, color: 'rgba(255,255,255,0.9)' }}>
          Map Overlay Button
        </Typography>
      </Grid>

      <Grid item xs={12}>
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <Button
            size="small"
            variant="outlined"
            onClick={(e) => openColorPicker(e.currentTarget, 'overlayButtonBgColor')}
            sx={{ borderColor: 'rgba(255,255,255,0.3)', color: 'rgba(255,255,255,0.9)' }}
          >
            <span style={{ display: 'inline-block', width: 16, height: 16, borderRadius: 3, background: nationalImpact.overlayButtonBgColor || 'transparent', border: '1px solid rgba(255,255,255,0.2)' }} />
            &nbsp;Button color
          </Button>
          <Button
            size="small"
            variant="outlined"
            onClick={(e) => openColorPicker(e.currentTarget, 'overlayButtonHoverBgColor')}
            sx={{ borderColor: 'rgba(255,255,255,0.3)', color: 'rgba(255,255,255,0.9)' }}
          >
            <span style={{ display: 'inline-block', width: 16, height: 16, borderRadius: 3, background: nationalImpact.overlayButtonHoverBgColor || 'transparent', border: '1px solid rgba(255,255,255,0.2)' }} />
            &nbsp;Button hover color
          </Button>
        </Box>
      </Grid>

      {/* ─────────────────────────────────────────────────────────────────────── */}
      {/* REGIONS */}
      {/* ─────────────────────────────────────────────────────────────────────── */}
      <Grid item xs={12}>
        <Divider sx={{ my: 2, bgcolor: 'rgba(255,255,255,0.1)' }} />
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6" sx={{ color: 'rgba(255,255,255,0.9)' }}>
            Regions & Locations
          </Typography>
          <Button
            startIcon={<AddIcon />}
            onClick={addRegion}
            variant="outlined"
            size="small"
            sx={{ borderColor: 'rgba(255,255,255,0.3)', color: 'rgba(255,255,255,0.9)' }}
          >
            Add Region
          </Button>
        </Box>
      </Grid>

      {regions.map((region, regionIndex) => (
        <Grid item xs={12} key={region.id}>
          <Paper
            sx={{
              bgcolor: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: 2,
              overflow: 'hidden',
            }}
          >
            {/* Region Header */}
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 2,
                p: 2,
                borderBottom: expandedRegions[region.id] ? '1px solid rgba(255,255,255,0.08)' : 'none',
                cursor: 'pointer',
              }}
              onClick={() => toggleRegion(region.id)}
            >
              <Box
                sx={{
                  width: 24,
                  height: 24,
                  borderRadius: '50%',
                  background: region.color || '#00D4FF',
                  cursor: 'pointer',
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  openRegionColorPicker(e.currentTarget, regionIndex);
                }}
              />
              <CustomTextField
                label="Region Name"
                value={region.name}
                onChange={(e) => updateRegion(regionIndex, 'name', e.target.value)}
                onClick={(e) => e.stopPropagation()}
                sx={{ flex: 1 }}
                placeholder="e.g., Miami"
              />
              <Chip
                label={`${region.locations.length} locations`}
                size="small"
                sx={{ bgcolor: 'rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.7)' }}
              />
              <IconButton
                onClick={(e) => {
                  e.stopPropagation();
                  removeRegion(regionIndex);
                }}
                sx={{ color: 'rgba(255,255,255,0.5)' }}
              >
                <DeleteIcon />
              </IconButton>
              {expandedRegions[region.id] ? <ExpandLessIcon /> : <ExpandMoreIcon />}
            </Box>

            {/* Region Locations */}
            <Collapse in={expandedRegions[region.id]}>
              <Box sx={{ p: 2 }}>
                {region.locations.map((location, locationIndex) => {
                  const locationKey = `${regionIndex}-${locationIndex}`;
                  const isValidating = validatingAddress === locationKey;
                  const hasError = !!addressError[locationKey];
                  const hasCoordinates = location.coordinates[0] !== 0 || location.coordinates[1] !== 0;

                  return (
                    <Box
                      key={location.id}
                      sx={{
                        p: 2,
                        mb: 2,
                        bgcolor: 'rgba(255,255,255,0.02)',
                        borderRadius: 2,
                        border: '1px solid rgba(255,255,255,0.06)',
                      }}
                    >
                      <Grid container spacing={2}>
                        {/* Location Name - Required */}
                        <Grid item xs={12} md={6}>
                          <CustomTextField
                            label="Location Name *"
                            value={location.name}
                            onChange={(e) => updateLocation(regionIndex, locationIndex, 'name', e.target.value)}
                            fullWidth
                            required
                            placeholder="e.g., Lake Stevens Middle School"
                          />
                        </Grid>

                        {/* Location Type */}
                        <Grid item xs={12} md={6}>
                          <FormControl fullWidth size="small">
                            <InputLabel sx={{ color: 'rgba(255,255,255,0.5)' }}>Icon Type</InputLabel>
                            <Select
                              value={location.type || 'default'}
                              label="Icon Type"
                              onChange={(e) => updateLocation(regionIndex, locationIndex, 'type', e.target.value)}
                              sx={{
                                color: 'white',
                                '.MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255,255,255,0.2)' },
                                '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255,255,255,0.3)' },
                              }}
                            >
                              {LOCATION_TYPES.map((lt) => (
                                <MenuItem key={lt.value} value={lt.value}>{lt.label}</MenuItem>
                              ))}
                            </Select>
                          </FormControl>
                        </Grid>

                        {/* Address with Validation - Required */}
                        <Grid item xs={12}>
                          <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-start' }}>
                            <CustomTextField
                              label="Address *"
                              value={location.address}
                              onChange={(e) => updateLocation(regionIndex, locationIndex, 'address', e.target.value)}
                              fullWidth
                              required
                              error={hasError}
                              helperText={hasError ? addressError[locationKey] : (hasCoordinates ? `Coordinates: ${location.coordinates[0].toFixed(4)}, ${location.coordinates[1].toFixed(4)}` : 'Enter address and click validate')}
                              placeholder="e.g., 18484 NW 48th Pl, Miami Gardens, FL 33055"
                              InputProps={{
                                endAdornment: hasCoordinates && !hasError ? (
                                  <CheckCircleIcon sx={{ color: '#4caf50', mr: 1 }} />
                                ) : hasError ? (
                                  <ErrorIcon sx={{ color: '#f44336', mr: 1 }} />
                                ) : null,
                              }}
                            />
                            <Button
                              variant="contained"
                              onClick={() => handleValidateAddress(regionIndex, locationIndex, location.address)}
                              disabled={isValidating || !location.address.trim()}
                              sx={{
                                minWidth: 100,
                                mt: 1,
                                bgcolor: 'rgba(255,255,255,0.1)',
                                '&:hover': { bgcolor: 'rgba(255,255,255,0.2)' },
                              }}
                            >
                              {isValidating ? <CircularProgress size={20} /> : 'Validate'}
                            </Button>
                          </Box>
                        </Grid>

                        {/* Show Address Toggle */}
                        <Grid item xs={12}>
                          <FormControlLabel
                            control={
                              <Switch
                                checked={location.showAddress ?? true}
                                onChange={(e) => updateLocation(regionIndex, locationIndex, 'showAddress', e.target.checked)}
                                sx={{ '& .MuiSwitch-switchBase.Mui-checked': { color: '#4caf50' } }}
                              />
                            }
                            label="Display address in popup"
                            sx={{ color: 'rgba(255,255,255,0.7)' }}
                          />
                        </Grid>

                        {/* Description - Optional */}
                        <Grid item xs={12}>
                          <CustomTextField
                            label="Description (optional)"
                            value={location.description || ''}
                            onChange={(e) => updateLocation(regionIndex, locationIndex, 'description', e.target.value || null)}
                            fullWidth
                            multiline
                            rows={2}
                            placeholder="Brief description of this location..."
                          />
                        </Grid>

                        {/* Website - Optional */}
                        <Grid item xs={12} md={6}>
                          <CustomTextField
                            label="Website (optional)"
                            value={location.website || ''}
                            onChange={(e) => updateLocation(regionIndex, locationIndex, 'website', e.target.value || null)}
                            fullWidth
                            placeholder="https://..."
                          />
                        </Grid>

                        {/* Delete Location */}
                        <Grid item xs={12} md={6}>
                          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 1 }}>
                            <Button
                              startIcon={<DeleteIcon />}
                              onClick={() => removeLocation(regionIndex, locationIndex)}
                              variant="outlined"
                              size="small"
                              sx={{ borderColor: 'rgba(255,255,255,0.2)', color: 'rgba(255,255,255,0.6)' }}
                            >
                              Remove Location
                            </Button>
                          </Box>
                        </Grid>
                      </Grid>
                    </Box>
                  );
                })}

                {/* Add Location Button */}
                <Button
                  startIcon={<AddIcon />}
                  onClick={() => addLocation(regionIndex)}
                  variant="outlined"
                  size="small"
                  sx={{ borderColor: 'rgba(255,255,255,0.3)', color: 'rgba(255,255,255,0.9)', mt: 1 }}
                >
                  Add Location to {region.name || 'Region'}
                </Button>
              </Box>
            </Collapse>
          </Paper>
        </Grid>
      ))}

      {regions.length === 0 && (
        <Grid item xs={12}>
          <Box
            sx={{
              p: 4,
              textAlign: 'center',
              bgcolor: 'rgba(255,255,255,0.02)',
              borderRadius: 2,
              border: '1px dashed rgba(255,255,255,0.1)',
            }}
          >
            <LocationOnIcon sx={{ fontSize: 48, color: 'rgba(255,255,255,0.3)', mb: 2 }} />
            <Typography sx={{ color: 'rgba(255,255,255,0.5)', mb: 2 }}>
              No regions added yet. Click "Add Region" to get started.
            </Typography>
          </Box>
        </Grid>
      )}
    </Grid>
  );
}

export default NationalImpactTabEditor;

