import React, { useState, useEffect, useRef } from 'react';
import {
  Autocomplete,
  TextField,
  CircularProgress,
  Box,
  Typography,
  InputAdornment,
} from '@mui/material';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

export interface PlaceSuggestion {
  displayName: string;
  coordinates: [number, number];
  placeId: string;
  type: string;
  addressType?: string;
}

export interface PlaceAutocompleteProps {
  /** Current value to display */
  value: string;
  /** Coordinates if already validated */
  coordinates?: [number, number];
  /** Called when a place is selected */
  onPlaceSelect: (place: { 
    displayName: string; 
    coordinates: [number, number];
  }) => void;
  /** Called when text input changes (for unvalidated input) */
  onInputChange?: (value: string) => void;
  /** Mode: 'city' for city-level search, 'address' for full addresses */
  mode: 'city' | 'address';
  /** Label for the field */
  label: string;
  /** Placeholder text */
  placeholder?: string;
  /** Whether field is required */
  required?: boolean;
  /** Error state */
  error?: boolean;
  /** Helper text */
  helperText?: string;
  /** Full width */
  fullWidth?: boolean;
}

// API URL - same as impact.api.ts
const API_BASE_URL =
  (import.meta.env.VITE_BACKEND_URL as string | undefined) ?? 'http://localhost:4000';

export function PlaceAutocomplete({
  value,
  coordinates,
  onPlaceSelect,
  onInputChange,
  mode,
  label,
  placeholder,
  required = false,
  error = false,
  helperText,
  fullWidth = true,
}: PlaceAutocompleteProps) {
  const [inputValue, setInputValue] = useState(value || '');
  const [options, setOptions] = useState<PlaceSuggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  
  // Track if a selection was made (for showing validated state)
  const hasValidCoordinates = coordinates && (coordinates[0] !== 0 || coordinates[1] !== 0);

  // Sync inputValue with external value changes
  useEffect(() => {
    setInputValue(value || '');
  }, [value]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  // Search function with debouncing
  const searchPlaces = (query: string) => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (!query || query.length < 3) {
      setOptions([]);
      setLoading(false);
      return;
    }

    debounceRef.current = setTimeout(async () => {
      try {
        const response = await fetch(
          `${API_BASE_URL}/api/impact/autocomplete-place?q=${encodeURIComponent(query)}&mode=${mode}`,
          { credentials: 'include' }
        );

        if (!response.ok) {
          console.warn('[PlaceAutocomplete] Search failed', { status: response.status });
          setOptions([]);
          return;
        }

        const data = await response.json();
        setOptions(data.suggestions || []);
      } catch (err) {
        console.error('[PlaceAutocomplete] Search error', err);
        setOptions([]);
      } finally {
        setLoading(false);
      }
    }, 300);
  };

  // Handle input changes
  const handleInputChange = (_event: React.SyntheticEvent, newInputValue: string) => {
    setInputValue(newInputValue);
    onInputChange?.(newInputValue);
    
    if (newInputValue.length >= 3) {
      setLoading(true);
      searchPlaces(newInputValue);
    } else {
      setOptions([]);
    }
  };

  // Handle selection
  const handleChange = (_event: React.SyntheticEvent, newValue: PlaceSuggestion | string | null) => {
    if (newValue && typeof newValue !== 'string') {
      onPlaceSelect({
        displayName: newValue.displayName,
        coordinates: newValue.coordinates,
      });
      setInputValue(newValue.displayName);
    }
  };

  return (
    <Autocomplete
      open={open}
      onOpen={() => setOpen(true)}
      onClose={() => setOpen(false)}
      freeSolo
      options={options}
      loading={loading}
      inputValue={inputValue}
      onInputChange={handleInputChange}
      onChange={handleChange}
      getOptionLabel={(option) => 
        typeof option === 'string' ? option : option.displayName
      }
      isOptionEqualToValue={(option, val) => option.placeId === val.placeId}
      filterOptions={(x) => x} // Don't filter on client, server already filtered
      fullWidth={fullWidth}
      renderInput={(params) => (
        <TextField
          {...params}
          label={label}
          placeholder={placeholder}
          required={required}
          error={error}
          helperText={helperText || (hasValidCoordinates 
            ? `✓ Coordinates: ${coordinates![0].toFixed(4)}, ${coordinates![1].toFixed(4)}`
            : mode === 'address' ? 'Start typing to search...' : undefined
          )}
          size="small"
          sx={{
            '& .MuiOutlinedInput-root': {
              bgcolor: 'rgba(255,255,255,0.06)',
              color: 'white',
              '& fieldset': { borderColor: error ? '#f44336' : 'rgba(255,255,255,0.2)' },
              '&:hover fieldset': { borderColor: 'rgba(255,255,255,0.3)' },
              '&.Mui-focused fieldset': { borderColor: 'rgba(255,255,255,0.5)' },
            },
            '& .MuiInputLabel-root': { 
              color: 'rgba(255,255,255,0.5)',
              '&.Mui-focused': { color: 'rgba(255,255,255,0.7)' }
            },
            '& .MuiFormHelperText-root': { 
              color: error ? '#f44336' : (hasValidCoordinates ? '#4caf50' : 'rgba(255,255,255,0.5)') 
            },
          }}
          InputProps={{
            ...params.InputProps,
            endAdornment: (
              <>
                {loading ? <CircularProgress color="inherit" size={20} /> : null}
                {hasValidCoordinates && !loading && (
                  <InputAdornment position="end">
                    <CheckCircleIcon sx={{ color: '#4caf50' }} />
                  </InputAdornment>
                )}
                {params.InputProps.endAdornment}
              </>
            ),
          }}
        />
      )}
      renderOption={(props, option) => (
        <Box
          component="li"
          {...props}
          sx={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: 1.5,
            py: 1.5,
            px: 2,
            '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' },
          }}
        >
          <LocationOnIcon sx={{ color: 'rgba(255,255,255,0.5)', mt: 0.5, flexShrink: 0 }} />
          <Box sx={{ flexGrow: 1, minWidth: 0 }}>
            <Typography
              sx={{
                color: 'rgba(255,255,255,0.9)',
                fontSize: '0.9rem',
                lineHeight: 1.4,
                wordBreak: 'break-word',
              }}
            >
              {option.displayName}
            </Typography>
            {option.addressType && (
              <Typography
                sx={{
                  color: 'rgba(255,255,255,0.5)',
                  fontSize: '0.75rem',
                  textTransform: 'uppercase',
                  mt: 0.25,
                }}
              >
                {option.addressType.replace(/_/g, ' ')}
              </Typography>
            )}
          </Box>
        </Box>
      )}
      ListboxProps={{
        sx: {
          bgcolor: 'rgba(30, 30, 30, 0.95)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: 1,
          '& .MuiAutocomplete-option': {
            color: 'rgba(255,255,255,0.9)',
          },
        },
      }}
      noOptionsText={
        inputValue.length < 3 
          ? 'Type at least 3 characters...'
          : loading 
            ? 'Searching...'
            : 'No results found'
      }
    />
  );
}

export default PlaceAutocomplete;

