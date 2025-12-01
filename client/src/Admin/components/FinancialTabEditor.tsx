import React, { useState, useMemo } from 'react';
import {
  Grid,
  Box,
  Typography,
  Button,
  Divider,
  IconButton,
  Slider,
  Alert,
  Switch,
  FormControlLabel,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import ColorPickerPopover from '../../components/ColorPickerPopover';
import { CustomTextField } from '../styles';
import { GradientEditor, parseGradientString, composeGradient } from './GradientEditor';
import { FinancialContent, FinancialPieItem } from '../../services/impact.api';
import COLORS from '../../../assets/colors';

// Gradient keys for financial section
type FinancialGradientKey = 'titleGradient' | 'sectionBgGradient';

export interface FinancialTabEditorProps {
  financial: FinancialContent;
  defaultSwatch: string[] | null;
  onFinancialChange: (field: keyof FinancialContent, value: any) => void;
}

// Default data for initialization
const DEFAULT_YEARS = [
  '2015',
  '2016',
  '2017-18',
  '2018-19',
  '2019-20',
  '2020-21',
  '2021-22',
  '2022-23',
];

const DEFAULT_REVENUE = [
  200000, 300000, 800000, 1400000, 2300000, 2500000, 3200000, 3400000,
];

const DEFAULT_EXPENSES = [
  150000, 280000, 500000, 1100000, 1500000, 2400000, 2950000, 3100000,
];

const DEFAULT_COMES_FROM: FinancialPieItem[] = [
  { id: 'foundations', label: "Foundations & The Children's Trust", value: 41, color: COLORS.gogo_blue },
  { id: 'individuals', label: 'Individuals', value: 19, color: COLORS.gogo_yellow },
  { id: 'government', label: 'Government Grants', value: 18, color: COLORS.gogo_purple },
  { id: 'program-services', label: 'Program Services & Earned Revenue', value: 15, color: COLORS.gogo_teal },
  { id: 'special-events', label: 'Special Events', value: 5, color: COLORS.gogo_pink },
  { id: 'corporate', label: 'Corporate Contributions', value: 2, color: '#bdbdbd' },
];

const DEFAULT_GOES_TO: FinancialPieItem[] = [
  { id: 'program-services', label: 'Program Services', value: 75, color: COLORS.gogo_blue },
  { id: 'admin', label: 'Administrative & General', value: 12, color: COLORS.gogo_purple },
  { id: 'fundraising', label: 'Fundraising', value: 13, color: COLORS.gogo_yellow },
];

type FinancialColorPickerField =
  | 'subtitleColor'
  | 'decorationColor1'
  | 'decorationColor2'
  | 'kpiValueColor'
  | 'kpiNetPositiveColor'
  | 'kpiNetNegativeColor'
  | 'revenueLineColor'
  | 'expenseLineColor'
  | 'lineChartBgColor'
  | 'axisLineColor'
  | 'axisLabelColor'
  | 'breakdownTextColor';

export function FinancialTabEditor({
  financial,
  defaultSwatch,
  onFinancialChange,
}: FinancialTabEditorProps) {
  const [colorPickerAnchor, setColorPickerAnchor] = useState<HTMLElement | null>(null);
  const [colorPickerField, setColorPickerField] = useState<FinancialColorPickerField | null>(null);
  const [pieItemPickerIndex, setPieItemPickerIndex] = useState<number | null>(null);
  const [pieItemPickerType, setPieItemPickerType] = useState<'comesFrom' | 'goesTo' | null>(null);
  
  // Toggle for entering money in millions (default: on)
  const [enterInMillions, setEnterInMillions] = useState(true);

  // State for gradient color picker
  const [gradientPickerAnchor, setGradientPickerAnchor] = useState<HTMLElement | null>(null);
  const [gradientPickerKey, setGradientPickerKey] = useState<FinancialGradientKey | null>(null);
  const [gradientPickerColorIndex, setGradientPickerColorIndex] = useState<number>(0);
  const gradientPickerOpen = Boolean(gradientPickerAnchor);

  // Get default gradients
  const getDefaultGradient = (key: FinancialGradientKey): string => {
    switch (key) {
      case 'titleGradient':
        return financial.titleGradient || `linear-gradient(90deg, ${COLORS.gogo_green}, ${COLORS.gogo_blue}, ${COLORS.gogo_purple})`;
      case 'sectionBgGradient':
        return financial.sectionBgGradient || 'linear-gradient(135deg, #121212, #1e1e1e)';
      default:
        return `linear-gradient(90deg, ${COLORS.gogo_blue}, ${COLORS.gogo_purple})`;
    }
  };

  // Get current gradient color for the picker
  const getGradientPickerColor = (): string => {
    if (!gradientPickerKey) return '#000000';
    const gradient = getDefaultGradient(gradientPickerKey);
    const parsed = parseGradientString(gradient);
    return parsed.colors[gradientPickerColorIndex] || '#000000';
  };

  const openGradientPicker = (el: HTMLElement, key: FinancialGradientKey, colorIndex: number) => {
    setGradientPickerKey(key);
    setGradientPickerColorIndex(colorIndex);
    setGradientPickerAnchor(el);
  };

  const handleGradientColorChange = (val: string) => {
    if (!gradientPickerKey) return;
    const currentGradient = getDefaultGradient(gradientPickerKey);
    const parsed = parseGradientString(currentGradient);
    const newColors = [...parsed.colors];
    newColors[gradientPickerColorIndex] = val;
    const newGradient = composeGradient(parsed.type, parsed.degree, newColors, parsed.opacity);
    onFinancialChange(gradientPickerKey, newGradient);
  };

  const years = financial.years ?? DEFAULT_YEARS;
  const revenueData = financial.revenueData ?? DEFAULT_REVENUE;
  const expenseData = financial.expenseData ?? DEFAULT_EXPENSES;
  const comesFromData = financial.comesFromData ?? DEFAULT_COMES_FROM;
  const goesToData = financial.goesToData ?? DEFAULT_GOES_TO;

  // Calculate pie chart totals for validation
  const comesFromTotal = useMemo(() => comesFromData.reduce((sum, item) => sum + item.value, 0), [comesFromData]);
  const goesToTotal = useMemo(() => goesToData.reduce((sum, item) => sum + item.value, 0), [goesToData]);
  const pieChartsValid = comesFromTotal === 100 && goesToTotal === 100;

  const getPickerValue = (): string => {
    if (pieItemPickerIndex !== null && pieItemPickerType === 'comesFrom') {
      return comesFromData[pieItemPickerIndex]?.color ?? '#000000';
    }
    if (pieItemPickerIndex !== null && pieItemPickerType === 'goesTo') {
      return goesToData[pieItemPickerIndex]?.color ?? '#000000';
    }
    if (colorPickerField) {
      switch (colorPickerField) {
        case 'subtitleColor':
          return financial.subtitleColor ?? 'rgba(255, 255, 255, 0.75)';
        case 'decorationColor1':
          return financial.decorationColor1 ?? 'rgba(25, 70, 245, 0.08)';
        case 'decorationColor2':
          return financial.decorationColor2 ?? 'rgba(190, 43, 147, 0.08)';
        case 'kpiValueColor':
          return financial.kpiValueColor ?? '#ffffff';
        case 'kpiNetPositiveColor':
          return financial.kpiNetPositiveColor ?? '#9BE15D';
        case 'kpiNetNegativeColor':
          return financial.kpiNetNegativeColor ?? '#FF8A80';
        case 'revenueLineColor':
          return financial.revenueLineColor ?? COLORS.gogo_blue;
        case 'expenseLineColor':
          return financial.expenseLineColor ?? COLORS.gogo_pink;
        case 'lineChartBgColor':
          return financial.lineChartBgColor ?? 'rgba(255, 255, 255, 0.04)';
        case 'axisLineColor':
          return financial.axisLineColor ?? '#666666';
        case 'axisLabelColor':
          return financial.axisLabelColor ?? '#aaaaaa';
        case 'breakdownTextColor':
          return financial.breakdownTextColor ?? 'rgba(255, 255, 255, 0.9)';
        default:
          return '#000000';
      }
    }
    return '#000000';
  };

  const handlePickerChange = (val: string) => {
    if (pieItemPickerIndex !== null && pieItemPickerType === 'comesFrom') {
      const next = [...comesFromData];
      if (next[pieItemPickerIndex]) {
        next[pieItemPickerIndex] = { ...next[pieItemPickerIndex], color: val };
        onFinancialChange('comesFromData', next);
      }
    } else if (pieItemPickerIndex !== null && pieItemPickerType === 'goesTo') {
      const next = [...goesToData];
      if (next[pieItemPickerIndex]) {
        next[pieItemPickerIndex] = { ...next[pieItemPickerIndex], color: val };
        onFinancialChange('goesToData', next);
      }
    } else if (colorPickerField) {
      // Direct field update
      onFinancialChange(colorPickerField as keyof FinancialContent, val);
    }
  };

  const openColorPicker = (el: HTMLElement, field: FinancialColorPickerField) => {
    setColorPickerField(field);
    setPieItemPickerIndex(null);
    setPieItemPickerType(null);
    setColorPickerAnchor(el);
  };

  const openPieColorPicker = (
    e: React.MouseEvent<HTMLElement>,
    index: number,
    type: 'comesFrom' | 'goesTo',
  ) => {
    setColorPickerField(null);
    setPieItemPickerIndex(index);
    setPieItemPickerType(type);
    setColorPickerAnchor(e.currentTarget);
  };

  // Helpers for data point editing
  const updateDataPoint = (
    dataKey: 'revenueData' | 'expenseData',
    index: number,
    value: number,
  ) => {
    const arr = dataKey === 'revenueData' ? [...revenueData] : [...expenseData];
    // If entering in millions, multiply by 1,000,000
    arr[index] = enterInMillions ? value * 1000000 : value;
    onFinancialChange(dataKey, arr);
  };

  const getDisplayValue = (value: number): number => {
    // If entering in millions, divide by 1,000,000 for display
    return enterInMillions ? value / 1000000 : value;
  };

  const updateYear = (index: number, value: string) => {
    const arr = [...years];
    arr[index] = value;
    onFinancialChange('years', arr);
  };

  const addDataPoint = () => {
    onFinancialChange('years', [...years, `Year ${years.length + 1}`]);
    onFinancialChange('revenueData', [...revenueData, 0]);
    onFinancialChange('expenseData', [...expenseData, 0]);
  };

  const removeDataPoint = (index: number) => {
    onFinancialChange(
      'years',
      years.filter((_, i) => i !== index),
    );
    onFinancialChange(
      'revenueData',
      revenueData.filter((_, i) => i !== index),
    );
    onFinancialChange(
      'expenseData',
      expenseData.filter((_, i) => i !== index),
    );
  };

  // Pie item helpers
  const updatePieItem = (
    type: 'comesFrom' | 'goesTo',
    index: number,
    field: keyof FinancialPieItem,
    value: string | number,
  ) => {
    const data = type === 'comesFrom' ? [...comesFromData] : [...goesToData];
    data[index] = { ...data[index], [field]: value };
    onFinancialChange(type === 'comesFrom' ? 'comesFromData' : 'goesToData', data);
  };

  const addPieItem = (type: 'comesFrom' | 'goesTo') => {
    const data = type === 'comesFrom' ? [...comesFromData] : [...goesToData];
    data.push({
      id: `item-${Date.now()}`,
      label: 'New Category',
      value: 0,
      color: COLORS.gogo_blue,
    });
    onFinancialChange(type === 'comesFrom' ? 'comesFromData' : 'goesToData', data);
  };

  const removePieItem = (type: 'comesFrom' | 'goesTo', index: number) => {
    const data = type === 'comesFrom' ? [...comesFromData] : [...goesToData];
    data.splice(index, 1);
    onFinancialChange(type === 'comesFrom' ? 'comesFromData' : 'goesToData', data);
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography
          variant="h5"
          sx={{ fontFamily: "'Airwaves', 'Century Gothic', 'Arial', sans-serif" }}
        >
          Financial Overview Section
        </Typography>
      </Box>
      <Divider sx={{ mb: 3, bgcolor: 'rgba(255,255,255,0.1)' }} />

      {/* Validation Warning */}
      {!pieChartsValid && (
        <Alert severity="warning" sx={{ mb: 3 }}>
          Pie charts must add up to 100% to save. 
          "Where Money Comes From" is at {comesFromTotal}%, 
          "Where Money Goes" is at {goesToTotal}%.
        </Alert>
      )}

      <Grid container spacing={{ xs: 2, md: 3 }}>
        {/* ─────────────────────────────────────────────────────────────────────── */}
        {/* HEADER */}
        {/* ─────────────────────────────────────────────────────────────────────── */}
        <Grid item xs={12}>
          <Typography variant="h6" sx={{ mb: 2, color: 'rgba(255,255,255,0.9)' }}>
            Section Header
          </Typography>
        </Grid>

        <Grid item xs={12}>
          <CustomTextField
            label="Title"
            value={financial.title ?? 'Financial Overview'}
            onChange={(e) => onFinancialChange('title', e.target.value)}
            fullWidth
          />
          <Box sx={{ mt: 1 }}>
            <Button
              size="small"
              variant="outlined"
              onClick={(e) => openColorPicker(e.currentTarget, 'subtitleColor')}
              sx={{
                mt: 1,
                borderColor: 'rgba(255,255,255,0.3)',
                color: 'rgba(255,255,255,0.9)',
              }}
            >
              <span
                style={{
                  display: 'inline-block',
                  width: 16,
                  height: 16,
                  borderRadius: 3,
                  background: financial.subtitleColor ?? 'rgba(255, 255, 255, 0.75)',
                  border: '1px solid rgba(255,255,255,0.2)',
                }}
              />
              &nbsp;Subtitle color
            </Button>
          </Box>
          
          {/* Title Gradient Editor with 3-color support */}
          <GradientEditor
            label="Title Gradient"
            value={getDefaultGradient('titleGradient')}
            onChange={(gradient) => onFinancialChange('titleGradient', gradient)}
            onPickColor={(el, colorIndex) => openGradientPicker(el, 'titleGradient', colorIndex)}
          />
        </Grid>

        <Grid item xs={12}>
          <CustomTextField
            label="Subtitle"
            value={
              financial.subtitle ??
              'Annual budget growth since 2015 and how resources are raised and allocated'
            }
            onChange={(e) => onFinancialChange('subtitle', e.target.value)}
            fullWidth
            multiline
            rows={2}
          />
        </Grid>

        {/* ─────────────────────────────────────────────────────────────────────── */}
        {/* BACKGROUND */}
        {/* ─────────────────────────────────────────────────────────────────────── */}
        <Grid item xs={12}>
          <Divider sx={{ my: 2, bgcolor: 'rgba(255,255,255,0.1)' }} />
          <Typography variant="h6" sx={{ mb: 2, color: 'rgba(255,255,255,0.9)' }}>
            Background & Decoration
          </Typography>
        </Grid>

        <Grid item xs={12}>
          <GradientEditor
            label="Section Background Gradient"
            value={getDefaultGradient('sectionBgGradient')}
            onChange={(gradient) => onFinancialChange('sectionBgGradient', gradient)}
            onPickColor={(el, colorIndex) => openGradientPicker(el, 'sectionBgGradient', colorIndex)}
          />
        </Grid>

        <Grid item xs={12} md={6}>
          <Button
            size="small"
            variant="outlined"
            onClick={(e) => openColorPicker(e.currentTarget, 'decorationColor1')}
            sx={{
              borderColor: 'rgba(255,255,255,0.3)',
              color: 'rgba(255,255,255,0.9)',
            }}
          >
            <span
              style={{
                display: 'inline-block',
                width: 16,
                height: 16,
                borderRadius: 3,
                background: financial.decorationColor1 ?? 'rgba(25, 70, 245, 0.08)',
                border: '1px solid rgba(255,255,255,0.2)',
              }}
            />
            &nbsp;Decoration glow 1 (top-left)
          </Button>
        </Grid>

        <Grid item xs={12} md={6}>
          <Button
            size="small"
            variant="outlined"
            onClick={(e) => openColorPicker(e.currentTarget, 'decorationColor2')}
            sx={{
              borderColor: 'rgba(255,255,255,0.3)',
              color: 'rgba(255,255,255,0.9)',
            }}
          >
            <span
              style={{
                display: 'inline-block',
                width: 16,
                height: 16,
                borderRadius: 3,
                background: financial.decorationColor2 ?? 'rgba(190, 43, 147, 0.08)',
                border: '1px solid rgba(255,255,255,0.2)',
              }}
            />
            &nbsp;Decoration glow 2 (bottom-right)
          </Button>
        </Grid>

        {/* ─────────────────────────────────────────────────────────────────────── */}
        {/* KPI CARDS */}
        {/* ─────────────────────────────────────────────────────────────────────── */}
        <Grid item xs={12}>
          <Divider sx={{ my: 2, bgcolor: 'rgba(255,255,255,0.1)' }} />
          <Typography variant="h6" sx={{ mb: 2, color: 'rgba(255,255,255,0.9)' }}>
            KPI Cards
          </Typography>
        </Grid>

        <Grid item xs={12} md={6}>
          <CustomTextField
            label="Revenue Label"
            value={financial.kpiRevenueLabel ?? 'Latest Revenue'}
            onChange={(e) => onFinancialChange('kpiRevenueLabel', e.target.value)}
            fullWidth
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <CustomTextField
            label="Expenses Label"
            value={financial.kpiExpensesLabel ?? 'Latest Expenses'}
            onChange={(e) => onFinancialChange('kpiExpensesLabel', e.target.value)}
            fullWidth
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <CustomTextField
            label="Net Label"
            value={financial.kpiNetLabel ?? 'Net'}
            onChange={(e) => onFinancialChange('kpiNetLabel', e.target.value)}
            fullWidth
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <CustomTextField
            label="YoY Label"
            value={financial.kpiYoyLabel ?? 'YoY Growth (Rev / Exp)'}
            onChange={(e) => onFinancialChange('kpiYoyLabel', e.target.value)}
            fullWidth
          />
        </Grid>

        <Grid item xs={12}>
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            <Button
              size="small"
              variant="outlined"
              onClick={(e) => openColorPicker(e.currentTarget, 'kpiValueColor')}
              sx={{ borderColor: 'rgba(255,255,255,0.3)', color: 'rgba(255,255,255,0.9)' }}
            >
              <span style={{ display: 'inline-block', width: 16, height: 16, borderRadius: 3, background: financial.kpiValueColor ?? '#ffffff', border: '1px solid rgba(255,255,255,0.2)' }} />
              &nbsp;KPI value color
            </Button>
            <Button
              size="small"
              variant="outlined"
              onClick={(e) => openColorPicker(e.currentTarget, 'kpiNetPositiveColor')}
              sx={{ borderColor: 'rgba(255,255,255,0.3)', color: 'rgba(255,255,255,0.9)' }}
            >
              <span style={{ display: 'inline-block', width: 16, height: 16, borderRadius: 3, background: financial.kpiNetPositiveColor ?? '#9BE15D', border: '1px solid rgba(255,255,255,0.2)' }} />
              &nbsp;Net positive color
            </Button>
            <Button
              size="small"
              variant="outlined"
              onClick={(e) => openColorPicker(e.currentTarget, 'kpiNetNegativeColor')}
              sx={{ borderColor: 'rgba(255,255,255,0.3)', color: 'rgba(255,255,255,0.9)' }}
            >
              <span style={{ display: 'inline-block', width: 16, height: 16, borderRadius: 3, background: financial.kpiNetNegativeColor ?? '#FF8A80', border: '1px solid rgba(255,255,255,0.2)' }} />
              &nbsp;Net negative color
            </Button>
          </Box>
        </Grid>

        {/* ─────────────────────────────────────────────────────────────────────── */}
        {/* LINE CHART */}
        {/* ─────────────────────────────────────────────────────────────────────── */}
        <Grid item xs={12}>
          <Divider sx={{ my: 2, bgcolor: 'rgba(255,255,255,0.1)' }} />
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6" sx={{ color: 'rgba(255,255,255,0.9)' }}>
              Line Chart
            </Typography>
            <FormControlLabel
              control={
                <Switch
                  checked={enterInMillions}
                  onChange={(e) => setEnterInMillions(e.target.checked)}
                  sx={{
                    '& .MuiSwitch-switchBase.Mui-checked': {
                      color: COLORS.gogo_blue,
                    },
                    '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                      backgroundColor: COLORS.gogo_blue,
                    },
                  }}
                />
              }
              label={
                <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                  Enter in millions
                </Typography>
              }
            />
          </Box>
        </Grid>

        <Grid item xs={12} md={6}>
          <CustomTextField
            label="Chart Title"
            value={financial.lineChartTitle ?? 'Annual Budget Growth (Since 2015)'}
            onChange={(e) => onFinancialChange('lineChartTitle', e.target.value)}
            fullWidth
          />
        </Grid>

        <Grid item xs={12} md={6}>
          <CustomTextField
            label={enterInMillions ? 'Max Y-Axis Value (millions $)' : 'Max Y-Axis Value ($)'}
            type="number"
            value={getDisplayValue(financial.maxYAxis ?? 4000000)}
            onChange={(e) => {
              const val = Number(e.target.value);
              onFinancialChange('maxYAxis', enterInMillions ? val * 1000000 : val);
            }}
            fullWidth
          />
        </Grid>

        <Grid item xs={12}>
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            <Button
              size="small"
              variant="outlined"
              onClick={(e) => openColorPicker(e.currentTarget, 'revenueLineColor')}
              sx={{ borderColor: 'rgba(255,255,255,0.3)', color: 'rgba(255,255,255,0.9)' }}
            >
              <span style={{ display: 'inline-block', width: 16, height: 16, borderRadius: 3, background: financial.revenueLineColor ?? COLORS.gogo_blue, border: '1px solid rgba(255,255,255,0.2)' }} />
              &nbsp;Revenue line color
            </Button>
            <Button
              size="small"
              variant="outlined"
              onClick={(e) => openColorPicker(e.currentTarget, 'expenseLineColor')}
              sx={{ borderColor: 'rgba(255,255,255,0.3)', color: 'rgba(255,255,255,0.9)' }}
            >
              <span style={{ display: 'inline-block', width: 16, height: 16, borderRadius: 3, background: financial.expenseLineColor ?? COLORS.gogo_pink, border: '1px solid rgba(255,255,255,0.2)' }} />
              &nbsp;Expense line color
            </Button>
          </Box>
        </Grid>

        <Grid item xs={12} md={6}>
          <CustomTextField
            label="Revenue Legend Label"
            value={financial.legendRevenueLabel ?? 'Revenue'}
            onChange={(e) => onFinancialChange('legendRevenueLabel', e.target.value)}
            fullWidth
          />
        </Grid>

        <Grid item xs={12} md={6}>
          <CustomTextField
            label="Expenses Legend Label"
            value={financial.legendExpensesLabel ?? 'Expenses'}
            onChange={(e) => onFinancialChange('legendExpensesLabel', e.target.value)}
            fullWidth
          />
        </Grid>

        {/* ─────────────────────────────────────────────────────────────────────── */}
        {/* FINANCIAL DATA */}
        {/* ─────────────────────────────────────────────────────────────────────── */}
        <Grid item xs={12}>
          <Divider sx={{ my: 2, bgcolor: 'rgba(255,255,255,0.1)' }} />
          <Typography variant="h6" sx={{ mb: 2, color: 'rgba(255,255,255,0.9)' }}>
            Year-by-Year Data
          </Typography>
        </Grid>

        {years.map((year, idx) => (
          <Grid item xs={12} key={idx}>
            <Box
              sx={{
                display: 'flex',
                gap: 2,
                alignItems: 'center',
                p: 2,
                bgcolor: 'rgba(255,255,255,0.03)',
                borderRadius: 2,
                border: '1px solid rgba(255,255,255,0.08)',
              }}
            >
              <CustomTextField
                label="Year"
                value={year}
                onChange={(e) => updateYear(idx, e.target.value)}
                sx={{ width: 120 }}
              />
              <CustomTextField
                label={enterInMillions ? 'Revenue (M)' : `Revenue ($${((revenueData[idx] ?? 0) / 1000000).toFixed(2)}m)`}
                type="number"
                value={getDisplayValue(revenueData[idx] ?? 0)}
                onChange={(e) => updateDataPoint('revenueData', idx, Number(e.target.value))}
                sx={{ flex: 1 }}
                inputProps={enterInMillions ? { step: 0.01 } : undefined}
              />
              <CustomTextField
                label={enterInMillions ? 'Expenses (M)' : `Expenses ($${((expenseData[idx] ?? 0) / 1000000).toFixed(2)}m)`}
                type="number"
                value={getDisplayValue(expenseData[idx] ?? 0)}
                onChange={(e) => updateDataPoint('expenseData', idx, Number(e.target.value))}
                sx={{ flex: 1 }}
                inputProps={enterInMillions ? { step: 0.01 } : undefined}
              />
              <IconButton
                onClick={() => removeDataPoint(idx)}
                sx={{ color: 'rgba(255,255,255,0.5)' }}
                disabled={years.length <= 2}
              >
                <DeleteIcon />
              </IconButton>
            </Box>
          </Grid>
        ))}

        {/* Add Year button moved to bottom */}
        <Grid item xs={12}>
          <Button
            variant="outlined"
            startIcon={<AddIcon />}
            onClick={addDataPoint}
            sx={{ borderColor: 'rgba(255,255,255,0.3)', color: 'white' }}
          >
            Add Year
          </Button>
        </Grid>

        {/* ─────────────────────────────────────────────────────────────────────── */}
        {/* PIE CHART: WHERE MONEY COMES FROM */}
        {/* ─────────────────────────────────────────────────────────────────────── */}
        <Grid item xs={12}>
          <Divider sx={{ my: 2, bgcolor: 'rgba(255,255,255,0.1)' }} />
          <Box sx={{ mb: 2 }}>
            <Typography variant="h6" sx={{ color: 'rgba(255,255,255,0.9)' }}>
              Where the Money Comes From
            </Typography>
            <Typography
              variant="caption"
              sx={{ color: comesFromTotal === 100 ? 'rgba(255,255,255,0.5)' : '#FF8A80' }}
            >
              Total: {comesFromTotal}% {comesFromTotal !== 100 && '(must equal 100%)'}
            </Typography>
          </Box>
        </Grid>

        <Grid item xs={12} md={6}>
          <CustomTextField
            label="Pie Chart Title"
            value={financial.comesFromTitle ?? 'Where the Money Comes From'}
            onChange={(e) => onFinancialChange('comesFromTitle', e.target.value)}
            fullWidth
          />
        </Grid>

        {comesFromData.map((item, idx) => (
          <Grid item xs={12} key={item.id}>
            <Box
              sx={{
                display: 'flex',
                gap: 2,
                alignItems: 'center',
                p: 2,
                bgcolor: 'rgba(255,255,255,0.03)',
                borderRadius: 2,
                border: '1px solid rgba(255,255,255,0.08)',
              }}
            >
              <CustomTextField
                label="Label"
                value={item.label}
                onChange={(e) => updatePieItem('comesFrom', idx, 'label', e.target.value)}
                sx={{ flex: 2 }}
              />
              <CustomTextField
                label="Value (%)"
                type="number"
                value={item.value}
                onChange={(e) => updatePieItem('comesFrom', idx, 'value', Number(e.target.value))}
                sx={{ width: 100 }}
              />
              <Button
                variant="outlined"
                onClick={(e) => openPieColorPicker(e, idx, 'comesFrom')}
                sx={{
                  borderColor: 'rgba(255,255,255,0.3)',
                  color: 'white',
                  textTransform: 'none',
                  minWidth: 50,
                }}
              >
                <Box
                  sx={{
                    width: 24,
                    height: 24,
                    borderRadius: 1,
                    bgcolor: item.color,
                    border: '1px solid rgba(255,255,255,0.3)',
                  }}
                />
              </Button>
              <IconButton
                onClick={() => removePieItem('comesFrom', idx)}
                sx={{ color: 'rgba(255,255,255,0.5)' }}
                disabled={comesFromData.length <= 1}
              >
                <DeleteIcon />
              </IconButton>
            </Box>
          </Grid>
        ))}

        {/* Add Category button moved to bottom */}
        <Grid item xs={12}>
          <Button
            variant="outlined"
            startIcon={<AddIcon />}
            onClick={() => addPieItem('comesFrom')}
            sx={{ borderColor: 'rgba(255,255,255,0.3)', color: 'white' }}
          >
            Add Category
          </Button>
        </Grid>

        {/* ─────────────────────────────────────────────────────────────────────── */}
        {/* PIE CHART: WHERE MONEY GOES */}
        {/* ─────────────────────────────────────────────────────────────────────── */}
        <Grid item xs={12}>
          <Divider sx={{ my: 2, bgcolor: 'rgba(255,255,255,0.1)' }} />
          <Box sx={{ mb: 2 }}>
            <Typography variant="h6" sx={{ color: 'rgba(255,255,255,0.9)' }}>
              Where the Money Goes
            </Typography>
            <Typography
              variant="caption"
              sx={{ color: goesToTotal === 100 ? 'rgba(255,255,255,0.5)' : '#FF8A80' }}
            >
              Total: {goesToTotal}% {goesToTotal !== 100 && '(must equal 100%)'}
            </Typography>
          </Box>
        </Grid>

        <Grid item xs={12} md={6}>
          <CustomTextField
            label="Pie Chart Title"
            value={financial.goesToTitle ?? 'Where the Money Goes'}
            onChange={(e) => onFinancialChange('goesToTitle', e.target.value)}
            fullWidth
          />
        </Grid>

        {goesToData.map((item, idx) => (
          <Grid item xs={12} key={item.id}>
            <Box
              sx={{
                display: 'flex',
                gap: 2,
                alignItems: 'center',
                p: 2,
                bgcolor: 'rgba(255,255,255,0.03)',
                borderRadius: 2,
                border: '1px solid rgba(255,255,255,0.08)',
              }}
            >
              <CustomTextField
                label="Label"
                value={item.label}
                onChange={(e) => updatePieItem('goesTo', idx, 'label', e.target.value)}
                sx={{ flex: 2 }}
              />
              <CustomTextField
                label="Value (%)"
                type="number"
                value={item.value}
                onChange={(e) => updatePieItem('goesTo', idx, 'value', Number(e.target.value))}
                sx={{ width: 100 }}
              />
              <Button
                variant="outlined"
                onClick={(e) => openPieColorPicker(e, idx, 'goesTo')}
                sx={{
                  borderColor: 'rgba(255,255,255,0.3)',
                  color: 'white',
                  textTransform: 'none',
                  minWidth: 50,
                }}
              >
                <Box
                  sx={{
                    width: 24,
                    height: 24,
                    borderRadius: 1,
                    bgcolor: item.color,
                    border: '1px solid rgba(255,255,255,0.3)',
                  }}
                />
              </Button>
              <IconButton
                onClick={() => removePieItem('goesTo', idx)}
                sx={{ color: 'rgba(255,255,255,0.5)' }}
                disabled={goesToData.length <= 1}
              >
                <DeleteIcon />
              </IconButton>
            </Box>
          </Grid>
        ))}

        {/* Add Category button moved to bottom */}
        <Grid item xs={12}>
          <Button
            variant="outlined"
            startIcon={<AddIcon />}
            onClick={() => addPieItem('goesTo')}
            sx={{ borderColor: 'rgba(255,255,255,0.3)', color: 'white' }}
          >
            Add Category
          </Button>
        </Grid>

        {/* ─────────────────────────────────────────────────────────────────────── */}
        {/* BREAKDOWN CARD */}
        {/* ─────────────────────────────────────────────────────────────────────── */}
        <Grid item xs={12}>
          <Divider sx={{ my: 2, bgcolor: 'rgba(255,255,255,0.1)' }} />
          <Typography variant="h6" sx={{ mb: 2, color: 'rgba(255,255,255,0.9)' }}>
            Breakdown Card
          </Typography>
        </Grid>

        <Grid item xs={12} md={6}>
          <CustomTextField
            label="Breakdown Title"
            value={financial.breakdownTitle ?? 'Breakdown'}
            onChange={(e) => onFinancialChange('breakdownTitle', e.target.value)}
            fullWidth
          />
        </Grid>

        <Grid item xs={12} md={6}>
          <Button
            size="small"
            variant="outlined"
            onClick={(e) => openColorPicker(e.currentTarget, 'breakdownTextColor')}
            sx={{ borderColor: 'rgba(255,255,255,0.3)', color: 'rgba(255,255,255,0.9)', mt: 2 }}
          >
            <span style={{ display: 'inline-block', width: 16, height: 16, borderRadius: 3, background: financial.breakdownTextColor ?? 'rgba(255, 255, 255, 0.9)', border: '1px solid rgba(255,255,255,0.2)' }} />
            &nbsp;Breakdown text color
          </Button>
        </Grid>

        {/* ─────────────────────────────────────────────────────────────────────── */}
        {/* CHART STYLING */}
        {/* ─────────────────────────────────────────────────────────────────────── */}
        <Grid item xs={12}>
          <Divider sx={{ my: 2, bgcolor: 'rgba(255,255,255,0.1)' }} />
          <Typography variant="h6" sx={{ mb: 2, color: 'rgba(255,255,255,0.9)' }}>
            Chart Styling
          </Typography>
        </Grid>

        <Grid item xs={12}>
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            <Button
              size="small"
              variant="outlined"
              onClick={(e) => openColorPicker(e.currentTarget, 'lineChartBgColor')}
              sx={{ borderColor: 'rgba(255,255,255,0.3)', color: 'rgba(255,255,255,0.9)' }}
            >
              <span style={{ display: 'inline-block', width: 16, height: 16, borderRadius: 3, background: financial.lineChartBgColor ?? 'rgba(255, 255, 255, 0.04)', border: '1px solid rgba(255,255,255,0.2)' }} />
              &nbsp;Chart background
            </Button>
            <Button
              size="small"
              variant="outlined"
              onClick={(e) => openColorPicker(e.currentTarget, 'axisLineColor')}
              sx={{ borderColor: 'rgba(255,255,255,0.3)', color: 'rgba(255,255,255,0.9)' }}
            >
              <span style={{ display: 'inline-block', width: 16, height: 16, borderRadius: 3, background: financial.axisLineColor ?? '#666666', border: '1px solid rgba(255,255,255,0.2)' }} />
              &nbsp;Axis line color
            </Button>
            <Button
              size="small"
              variant="outlined"
              onClick={(e) => openColorPicker(e.currentTarget, 'axisLabelColor')}
              sx={{ borderColor: 'rgba(255,255,255,0.3)', color: 'rgba(255,255,255,0.9)' }}
            >
              <span style={{ display: 'inline-block', width: 16, height: 16, borderRadius: 3, background: financial.axisLabelColor ?? '#aaaaaa', border: '1px solid rgba(255,255,255,0.2)' }} />
              &nbsp;Axis label color
            </Button>
          </Box>
        </Grid>

        <Grid item xs={12} md={6}>
          <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.7)', mb: 1, display: 'block' }}>
            Pie Chart Inner Radius (0-1)
          </Typography>
          <Slider
            value={financial.pieChartInnerRadius ?? 0.6}
            onChange={(_, val) => onFinancialChange('pieChartInnerRadius', val as number)}
            min={0}
            max={0.9}
            step={0.05}
            valueLabelDisplay="auto"
            sx={{ color: COLORS.gogo_blue }}
          />
        </Grid>
      </Grid>

      {/* Color Picker Popover */}
      <ColorPickerPopover
        open={Boolean(colorPickerAnchor)}
        anchorEl={colorPickerAnchor}
        onClose={() => {
          setColorPickerAnchor(null);
          setColorPickerField(null);
          setPieItemPickerIndex(null);
          setPieItemPickerType(null);
        }}
        color={getPickerValue()}
        onChange={handlePickerChange}
        presetColors={defaultSwatch ?? undefined}
      />

      {/* Gradient Color Picker Popover */}
      <ColorPickerPopover
        open={gradientPickerOpen}
        anchorEl={gradientPickerAnchor}
        onClose={() => {
          setGradientPickerAnchor(null);
          setGradientPickerKey(null);
        }}
        color={getGradientPickerColor()}
        onChange={handleGradientColorChange}
        presetColors={defaultSwatch ?? undefined}
      />
    </Box>
  );
}

// Export validation helper for use in the main customization page
export function validateFinancialPieCharts(financial: FinancialContent): boolean {
  const comesFromData = financial.comesFromData ?? [];
  const goesToData = financial.goesToData ?? [];
  const comesFromTotal = comesFromData.reduce((sum, item) => sum + item.value, 0);
  const goesToTotal = goesToData.reduce((sum, item) => sum + item.value, 0);
  return comesFromTotal === 100 && goesToTotal === 100;
}

export default FinancialTabEditor;
