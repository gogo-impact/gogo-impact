import React, { useState, useMemo } from 'react';
import {
  Grid,
  Box,
  Typography,
  Button,
  Divider,
  IconButton,
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
import LocationOnIcon from '@mui/icons-material/LocationOn';
import MapIcon from '@mui/icons-material/Map';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import ColorPickerPopover from '../../components/ColorPickerPopover';
import EnhancedLeafletMap from '../../components/map/EnhancedLeafletMap';
import { CustomTextField } from '../styles';
import PlaceAutocomplete from './PlaceAutocomplete';
import {
  NationalImpactContent,
  MapRegion,
  MapLocation,
  MapLocationType,
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
  
  // Map preview state
  const [showMapPreview, setShowMapPreview] = useState(false);

  const regions: MapRegion[] = nationalImpact.regions ?? [];
  
  // Generate a key for the map that only changes when map-visual data changes
  // (coordinates, colors, location count) - NOT on every text edit
  const mapPreviewKey = useMemo(() => {
    // Only include data that affects map rendering
    const mapRelevantData = regions.map(r => ({
      id: r.id,
      color: r.color,
      coordinates: r.coordinates,
      locationCount: r.locations?.length || 0,
      // Only coordinates and type affect map markers
      locations: r.locations?.map(l => ({
        coordinates: l.coordinates,
        type: l.type,
      })),
    }));
    const dataString = JSON.stringify(mapRelevantData);
    // Simple hash function
    let hash = 0;
    for (let i = 0; i < dataString.length; i++) {
      const char = dataString.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return `map-preview-${hash}`;
  }, [regions]);

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

  // Handle place selection from autocomplete (for address)
  const handleAddressSelect = (
    regionIndex: number,
    locationIndex: number,
    place: { displayName: string; coordinates: [number, number] }
  ) => {
    const updated = [...regions];
    const locations = [...updated[regionIndex].locations];
    locations[locationIndex] = {
      ...locations[locationIndex],
      address: place.displayName,
      coordinates: place.coordinates,
    };
    updated[regionIndex] = { ...updated[regionIndex], locations };
    onNationalImpactChange('regions', updated);
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
              <Box onClick={(e) => e.stopPropagation()} sx={{ flex: 1 }}>
                <PlaceAutocomplete
                  value={region.name}
                  coordinates={region.coordinates ?? undefined}
                  onPlaceSelect={(place) => {
                    // Extract city name from the display name (first part before comma)
                    const cityName = place.displayName.split(',')[0].trim();
                    // Update both name and coordinates
                    const updated = [...regions];
                    updated[regionIndex] = {
                      ...updated[regionIndex],
                      name: cityName,
                      coordinates: place.coordinates,
                    };
                    onNationalImpactChange('regions', updated);
                  }}
                  onInputChange={(value) => updateRegion(regionIndex, 'name', value)}
                  mode="city"
                  label="Region Name"
                  placeholder="e.g., Miami"
                />
              </Box>
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
                            <InputLabel sx={{ color: 'rgba(255,255,255,0.5)', '&.Mui-focused': { color: 'rgba(255,255,255,0.7)' } }}>Icon Type</InputLabel>
                            <Select
                              value={location.type || 'default'}
                              label="Icon Type"
                              onChange={(e) => updateLocation(regionIndex, locationIndex, 'type', e.target.value)}
                              sx={{
                                color: 'white',
                                bgcolor: 'rgba(255,255,255,0.06)',
                                '.MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255,255,255,0.2)' },
                                '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255,255,255,0.3)' },
                                '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255,255,255,0.5)' },
                                '.MuiSvgIcon-root': { color: 'rgba(255,255,255,0.5)' },
                              }}
                              MenuProps={{
                                PaperProps: {
                                  sx: {
                                    bgcolor: 'rgba(30, 30, 30, 0.95)',
                                    backdropFilter: 'blur(10px)',
                                    border: '1px solid rgba(255,255,255,0.1)',
                                    '& .MuiMenuItem-root': {
                                      color: 'rgba(255,255,255,0.9)',
                                      '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' },
                                      '&.Mui-selected': { bgcolor: 'rgba(255,255,255,0.15)' },
                                      '&.Mui-selected:hover': { bgcolor: 'rgba(255,255,255,0.2)' },
                                    },
                                  },
                                },
                              }}
                            >
                              {LOCATION_TYPES.map((lt) => (
                                <MenuItem key={lt.value} value={lt.value}>{lt.label}</MenuItem>
                              ))}
                            </Select>
                          </FormControl>
                        </Grid>

                        {/* Address with Autocomplete - Required */}
                        <Grid item xs={12}>
                          <PlaceAutocomplete
                            value={location.address}
                            coordinates={location.coordinates}
                            onPlaceSelect={(place) => handleAddressSelect(regionIndex, locationIndex, place)}
                            onInputChange={(value) => updateLocation(regionIndex, locationIndex, 'address', value)}
                            mode="address"
                            label="Address *"
                            placeholder="Start typing an address..."
                            required
                          />
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

      {/* ─────────────────────────────────────────────────────────────────────── */}
      {/* MAP PREVIEW */}
      {/* ─────────────────────────────────────────────────────────────────────── */}
      <Grid item xs={12}>
        <Divider sx={{ my: 2, bgcolor: 'rgba(255,255,255,0.1)' }} />
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <MapIcon sx={{ color: 'rgba(255,255,255,0.7)' }} />
            <Typography variant="h6" sx={{ color: 'rgba(255,255,255,0.9)' }}>
              Map Preview
            </Typography>
          </Box>
          <Button
            startIcon={showMapPreview ? <VisibilityOffIcon /> : <VisibilityIcon />}
            onClick={() => setShowMapPreview(!showMapPreview)}
            variant="outlined"
            size="small"
            sx={{ borderColor: 'rgba(255,255,255,0.3)', color: 'rgba(255,255,255,0.9)' }}
          >
            {showMapPreview ? 'Hide Preview' : 'Show Preview'}
          </Button>
        </Box>
      </Grid>

      <Collapse in={showMapPreview} sx={{ width: '100%' }}>
        <Grid item xs={12}>
          <Paper
            sx={{
              bgcolor: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: 2,
              overflow: 'hidden',
              p: 2,
            }}
          >
            {/* Preview Stats */}
            <Box sx={{ display: 'flex', gap: 2, mb: 2, flexWrap: 'wrap' }}>
              <Typography sx={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.85rem' }}>
                Live preview showing:
              </Typography>
              <Chip
                size="small"
                label={`${regions.length} regions`}
                sx={{ bgcolor: 'rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.8)' }}
              />
              <Chip
                size="small"
                label={`${regions.reduce((sum, r) => sum + (r.locations?.length || 0), 0)} locations`}
                sx={{ bgcolor: 'rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.8)' }}
              />
              <Chip
                size="small"
                label={`${regions.reduce((sum, r) => sum + (r.locations?.filter(l => l.coordinates && l.coordinates[0] !== 0).length || 0), 0)} with coordinates`}
                sx={{ bgcolor: 'rgba(76, 175, 80, 0.2)', color: '#4caf50', border: '1px solid rgba(76, 175, 80, 0.3)' }}
              />
            </Box>
            
            <Box
              sx={{
                borderRadius: 2,
                overflow: 'hidden',
                border: '1px solid rgba(255,255,255,0.1)',
              }}
            >
              <EnhancedLeafletMap
                key={mapPreviewKey}
                regions={regions}
                overlayButtonBgColor={nationalImpact.overlayButtonBgColor || undefined}
                overlayButtonHoverBgColor={nationalImpact.overlayButtonHoverBgColor || undefined}
              />
            </Box>
            <Typography sx={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.75rem', mt: 1, fontStyle: 'italic' }}>
              Map updates live as you edit. Only locations with valid coordinates will appear on the map.
            </Typography>
          </Paper>
        </Grid>
      </Collapse>
    </Grid>
  );
}

export default NationalImpactTabEditor;

