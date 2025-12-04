import React, { useState, useCallback } from 'react';
import {
  Box,
  Typography,
  IconButton,
  Tooltip,
} from '@mui/material';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import RestoreIcon from '@mui/icons-material/Restore';
import {
  ReorderableSectionKey,
  DEFAULT_SECTION_ORDER,
  SECTION_DISPLAY_NAMES,
} from '../../services/impact.api';

interface SectionOrderEditorProps {
  value: ReorderableSectionKey[];
  onChange: (newOrder: ReorderableSectionKey[]) => void;
}

const SectionOrderEditor: React.FC<SectionOrderEditorProps> = ({
  value,
  onChange,
}) => {
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  const handleDragStart = useCallback(
    (e: React.DragEvent<HTMLDivElement>, index: number) => {
      setDraggedIndex(index);
      e.dataTransfer.effectAllowed = 'move';
      e.dataTransfer.setData('text/plain', String(index));
      const target = e.currentTarget;
      setTimeout(() => {
        target.style.opacity = '0.5';
      }, 0);
    },
    []
  );

  const handleDragEnd = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.currentTarget.style.opacity = '1';
    setDraggedIndex(null);
    setDragOverIndex(null);
  }, []);

  const handleDragOver = useCallback(
    (e: React.DragEvent<HTMLDivElement>, index: number) => {
      e.preventDefault();
      e.dataTransfer.dropEffect = 'move';
      if (draggedIndex !== null && index !== draggedIndex) {
        setDragOverIndex(index);
      }
    },
    [draggedIndex]
  );

  const handleDragLeave = useCallback(() => {
    setDragOverIndex(null);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>, dropIndex: number) => {
      e.preventDefault();
      const sourceIndex = draggedIndex;
      if (sourceIndex === null || sourceIndex === dropIndex) return;

      const newOrder = [...value];
      const [removed] = newOrder.splice(sourceIndex, 1);
      newOrder.splice(dropIndex, 0, removed);
      onChange(newOrder);

      setDraggedIndex(null);
      setDragOverIndex(null);
    },
    [draggedIndex, value, onChange]
  );

  const moveItem = useCallback(
    (index: number, direction: 'up' | 'down') => {
      const newIndex = direction === 'up' ? index - 1 : index + 1;
      if (newIndex < 0 || newIndex >= value.length) return;

      const newOrder = [...value];
      const [removed] = newOrder.splice(index, 1);
      newOrder.splice(newIndex, 0, removed);
      onChange(newOrder);
    },
    [value, onChange]
  );

  const handleReset = useCallback(() => {
    onChange([...DEFAULT_SECTION_ORDER]);
  }, [onChange]);

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, gap: 1 }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 600, color: 'white' }}>
          Section Order
        </Typography>
        <Tooltip title="Reset to default order">
          <IconButton 
            size="small" 
            onClick={handleReset}
            sx={{ color: 'rgba(255,255,255,0.7)', '&:hover': { color: 'white' } }}
          >
            <RestoreIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </Box>
      <Typography variant="body2" sx={{ mb: 2, color: 'rgba(255,255,255,0.6)' }}>
        Drag and drop sections to reorder how they appear on the impact report
        page and in the admin tabs.
      </Typography>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          gap: 0.5,
          maxHeight: 500,
          overflowY: 'auto',
          pr: 1,
          // Custom scrollbar for dark mode
          '&::-webkit-scrollbar': {
            width: 8,
          },
          '&::-webkit-scrollbar-track': {
            background: 'rgba(255,255,255,0.05)',
            borderRadius: 4,
          },
          '&::-webkit-scrollbar-thumb': {
            background: 'rgba(255,255,255,0.2)',
            borderRadius: 4,
            '&:hover': {
              background: 'rgba(255,255,255,0.3)',
            },
          },
        }}
      >
        {value.map((sectionKey, index) => (
          <Box
            key={sectionKey}
            draggable
            onDragStart={(e) => handleDragStart(e, index)}
            onDragEnd={handleDragEnd}
            onDragOver={(e) => handleDragOver(e, index)}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDrop(e, index)}
            sx={{
              display: 'flex',
              alignItems: 'center',
              px: 1.5,
              py: 1,
              cursor: 'grab',
              userSelect: 'none',
              bgcolor:
                dragOverIndex === index
                  ? 'rgba(255,255,255,0.15)'
                  : draggedIndex === index
                  ? 'rgba(255,255,255,0.12)'
                  : 'rgba(255,255,255,0.05)',
              borderRadius: 1,
              border: '1px solid',
              borderColor:
                dragOverIndex === index
                  ? 'rgba(25, 70, 245, 0.6)'
                  : 'rgba(255,255,255,0.1)',
              borderLeft:
                dragOverIndex === index
                  ? '3px solid #1946f5'
                  : '3px solid transparent',
              transition: 'all 0.15s ease',
              boxShadow: draggedIndex === index 
                ? '0 4px 12px rgba(0,0,0,0.3)' 
                : 'none',
              '&:hover': {
                bgcolor: 'rgba(255,255,255,0.1)',
                borderColor: 'rgba(255,255,255,0.2)',
              },
              '&:active': {
                cursor: 'grabbing',
              },
            }}
          >
            <DragIndicatorIcon
              sx={{ mr: 1.5, color: 'rgba(255,255,255,0.5)', fontSize: 20 }}
            />
            <Typography
              variant="body2"
              sx={{
                flex: 1,
                fontWeight: 500,
                color: 'white',
              }}
            >
              {index + 1}. {SECTION_DISPLAY_NAMES[sectionKey]}
            </Typography>
            <Box sx={{ display: 'flex', gap: 0.5 }}>
              <Tooltip title="Move up">
                <span>
                  <IconButton
                    size="small"
                    onClick={() => moveItem(index, 'up')}
                    disabled={index === 0}
                    sx={{
                      color: 'rgba(255,255,255,0.7)',
                      '&:hover': { color: 'white', bgcolor: 'rgba(255,255,255,0.1)' },
                      '&.Mui-disabled': { color: 'rgba(255,255,255,0.2)' },
                    }}
                  >
                    <ArrowUpwardIcon fontSize="small" />
                  </IconButton>
                </span>
              </Tooltip>
              <Tooltip title="Move down">
                <span>
                  <IconButton
                    size="small"
                    onClick={() => moveItem(index, 'down')}
                    disabled={index === value.length - 1}
                    sx={{
                      color: 'rgba(255,255,255,0.7)',
                      '&:hover': { color: 'white', bgcolor: 'rgba(255,255,255,0.1)' },
                      '&.Mui-disabled': { color: 'rgba(255,255,255,0.2)' },
                    }}
                  >
                    <ArrowDownwardIcon fontSize="small" />
                  </IconButton>
                </span>
              </Tooltip>
            </Box>
          </Box>
        ))}
      </Box>
    </Box>
  );
};

export default SectionOrderEditor;

