import React, { useState } from 'react';
import { Grid, Box, Typography, Button, Divider } from '@mui/material';
import ColorPickerPopover from '../../components/ColorPickerPopover';
import { CustomPaper } from '../styles';
import { toHex, getReadableTextColor, withAlphaHex } from '../utils';
import { DEFAULT_SWATCH_SIZE } from '../types';
import COLORS from '../../../assets/colors';

export interface DefaultsTabEditorProps {
  defaultSwatch: string[] | null;
  onSwatchChange: (swatch: string[]) => void;
  onDirtyChange: () => void;
}

export function DefaultsTabEditor({
  defaultSwatch,
  onSwatchChange,
  onDirtyChange,
}: DefaultsTabEditorProps) {
  const [defaultsPickerAnchor, setDefaultsPickerAnchor] = useState<HTMLElement | null>(null);
  const [defaultsPickerValue, setDefaultsPickerValue] = useState<string>('#1946f5');
  const [selectedSwatchIndex, setSelectedSwatchIndex] = useState<number | null>(null);
  const defaultsPickerOpen = Boolean(defaultsPickerAnchor);

  return (
    <Box>
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
          Overall Defaults
        </Typography>
      </Box>
      <Divider sx={{ mb: 3, bgcolor: 'rgba(255,255,255,0.1)' }} />
      <Grid container spacing={{ xs: 2, md: 3 }}>
        <Grid item xs={12}>
          <Typography variant="subtitle1" gutterBottom>
            Default Swatch
          </Typography>
          <Box
            sx={{
              display: 'flex',
              gap: 1.5,
              flexWrap: 'wrap',
              alignItems: 'center',
            }}
          >
            {Array.from({ length: DEFAULT_SWATCH_SIZE }).map((_, i) => {
              const c = (defaultSwatch ?? [])[i] ?? '#1946f5';
              return (
                <button
                  key={`swatch-${i}`}
                  type="button"
                  style={{
                    width: 30,
                    height: 30,
                    borderRadius: 6,
                    background: c,
                    border: '1px solid rgba(255,255,255,0.25)',
                    cursor: 'pointer',
                  }}
                  title={`${c} (slot ${i + 1})`}
                  aria-label={`${c} (slot ${i + 1})`}
                  onClick={(e) => {
                    setSelectedSwatchIndex(i);
                    setDefaultsPickerValue(c);
                    setDefaultsPickerAnchor(e.currentTarget as HTMLElement);
                  }}
                />
              );
            })}
            <Button
              variant="text"
              onClick={() => {
                const brand = [
                  COLORS.gogo_blue,
                  COLORS.gogo_purple,
                  COLORS.gogo_teal,
                  COLORS.gogo_yellow,
                  COLORS.gogo_pink,
                  COLORS.gogo_green,
                ];
                const normalized = Array.from({ length: DEFAULT_SWATCH_SIZE }).map(
                  (_, i) => brand[i % brand.length]
                );
                onSwatchChange(normalized);
                onDirtyChange();
              }}
            >
              Reset to Brand
            </Button>
          </Box>
          <ColorPickerPopover
            open={defaultsPickerOpen}
            anchorEl={defaultsPickerAnchor}
            onClose={() => {
              setDefaultsPickerAnchor(null);
              setSelectedSwatchIndex(null);
            }}
            value={defaultsPickerValue}
            onChange={(val) => {
              setDefaultsPickerValue(val);
              if (selectedSwatchIndex != null) {
                const base = (defaultSwatch ?? []).slice(0, DEFAULT_SWATCH_SIZE);
                while (base.length < DEFAULT_SWATCH_SIZE) base.push('#1946f5');
                base[selectedSwatchIndex] = val;
                onSwatchChange(base);
                onDirtyChange();
              }
            }}
            presets={defaultSwatch ?? undefined}
          />
          {/* Confirm update button */}
          {defaultsPickerOpen && selectedSwatchIndex != null && (
            <Box sx={{ mt: 1 }}>
              <Button
                size="small"
                variant="contained"
                onClick={() => {
                  const base = (defaultSwatch ?? []).slice(0, DEFAULT_SWATCH_SIZE);
                  while (base.length < DEFAULT_SWATCH_SIZE) base.push('#1946f5');
                  base[selectedSwatchIndex] = defaultsPickerValue;
                  onSwatchChange(base);
                  setDefaultsPickerAnchor(null);
                  setSelectedSwatchIndex(null);
                  onDirtyChange();
                }}
              >
                Use This Color
              </Button>
            </Box>
          )}
        </Grid>
      </Grid>
    </Box>
  );
}

// Preview component for the defaults tab
export interface DefaultsPreviewProps {
  defaultSwatch: string[] | null;
}

export function DefaultsPreview({ defaultSwatch }: DefaultsPreviewProps) {
  return (
    <Box sx={{ p: 2 }}>
      <Grid container spacing={2}>
        {(defaultSwatch ?? []).map((c, i) => {
          const text = getReadableTextColor(c);
          const accent =
            (defaultSwatch ?? [])[(i + 1) % (defaultSwatch?.length || 1) || 0] || c;
          const subtle = withAlphaHex(text === '#ffffff' ? '#000000' : '#ffffff', 0.08);
          return (
            <Grid item xs={12} sm={6} key={`swatch-preview-left-${i}`}>
              <Box
                sx={{
                  position: 'relative',
                  minHeight: 160,
                  borderRadius: 2,
                  overflow: 'hidden',
                  boxShadow: '0 10px 30px rgba(0,0,0,0.28)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  background: c,
                }}
              >
                <Box
                  sx={{
                    position: 'absolute',
                    left: 0,
                    top: 0,
                    bottom: 0,
                    width: '30%',
                    backgroundImage: `repeating-linear-gradient(0deg, ${subtle}, ${subtle} 6px, transparent 6px, transparent 14px)`,
                  }}
                />
                <Box
                  sx={{
                    position: 'absolute',
                    right: -20,
                    top: -20,
                    width: 120,
                    height: 120,
                    borderRadius: '50%',
                    background: withAlphaHex(accent, 0.35),
                    border: `4px solid ${withAlphaHex(text, 0.4)}`,
                  }}
                />
                <Box
                  sx={{
                    position: 'absolute',
                    left: '38%',
                    bottom: 12,
                    width: 0,
                    height: 0,
                    borderLeft: '26px solid transparent',
                    borderRight: '26px solid transparent',
                    borderBottom: `46px solid ${withAlphaHex(accent, 0.8)}`,
                    filter: 'drop-shadow(0 3px 8px rgba(0,0,0,0.28))',
                  }}
                />
                <Box
                  sx={{
                    position: 'absolute',
                    left: 16,
                    top: 16,
                    color: text,
                  }}
                >
                  <Typography
                    variant="h6"
                    sx={{
                      fontWeight: 900,
                      letterSpacing: 0.2,
                      textShadow:
                        text === '#ffffff'
                          ? '0 1px 2px rgba(0,0,0,0.25)'
                          : '0 1px 0 rgba(255,255,255,0.35)',
                    }}
                  >
                    Preview
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.92 }}>
                    {toHex(c)}
                  </Typography>
                </Box>
              </Box>
            </Grid>
          );
        })}
      </Grid>
    </Box>
  );
}

export default DefaultsTabEditor;




