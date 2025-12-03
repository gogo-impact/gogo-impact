import React, { useState, useCallback } from 'react';
import Cropper, { Area } from 'react-easy-crop';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Slider,
  Typography,
  CircularProgress,
} from '@mui/material';
import ZoomInIcon from '@mui/icons-material/ZoomIn';
import ZoomOutIcon from '@mui/icons-material/ZoomOut';

export interface ImageCropperProps {
  open: boolean;
  imageSrc: string;
  onClose: () => void;
  onCropComplete: (croppedBlob: Blob) => void;
  /** Aspect ratio for cropping. Pass undefined for freeform cropping. */
  aspectRatio?: number;
  /** Fixed output width. For freeform crops, if not provided, uses cropped area width. */
  outputWidth?: number;
  /** Fixed output height. For freeform crops, if not provided, uses cropped area height. */
  outputHeight?: number;
  /** Maximum output dimension for freeform crops (default 1200). Ignored when aspectRatio is set. */
  maxOutputSize?: number;
  title?: string;
}

/**
 * Creates an image element from a source URL
 */
function createImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.addEventListener('load', () => resolve(image));
    image.addEventListener('error', (error) => reject(error));
    image.setAttribute('crossOrigin', 'anonymous');
    image.src = url;
  });
}

/**
 * Crops the image and returns a Blob.
 * If outputWidth/outputHeight are not provided, uses the crop area dimensions (capped by maxSize).
 */
async function getCroppedImg(
  imageSrc: string,
  pixelCrop: Area,
  outputWidth?: number,
  outputHeight?: number,
  maxSize: number = 1200
): Promise<Blob> {
  const image = await createImage(imageSrc);
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  if (!ctx) {
    throw new Error('No 2d context');
  }

  // Calculate output dimensions
  let finalWidth: number;
  let finalHeight: number;

  if (outputWidth && outputHeight) {
    // Fixed dimensions provided
    finalWidth = outputWidth;
    finalHeight = outputHeight;
  } else {
    // Freeform crop: use crop area dimensions, scaled down if needed
    const cropAspect = pixelCrop.width / pixelCrop.height;
    if (pixelCrop.width > maxSize || pixelCrop.height > maxSize) {
      if (cropAspect > 1) {
        // Wider than tall
        finalWidth = maxSize;
        finalHeight = Math.round(maxSize / cropAspect);
      } else {
        // Taller than wide
        finalHeight = maxSize;
        finalWidth = Math.round(maxSize * cropAspect);
      }
    } else {
      finalWidth = pixelCrop.width;
      finalHeight = pixelCrop.height;
    }
  }

  // Set canvas size to the desired output dimensions
  canvas.width = finalWidth;
  canvas.height = finalHeight;

  // Draw the cropped image
  ctx.drawImage(
    image,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    finalWidth,
    finalHeight
  );

  // Return as blob
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) {
          resolve(blob);
        } else {
          reject(new Error('Canvas is empty'));
        }
      },
      'image/jpeg',
      0.9
    );
  });
}

// Default to carousel dimensions (200x140 scaled up 2x for better quality)
const DEFAULT_OUTPUT_WIDTH = 400;
const DEFAULT_OUTPUT_HEIGHT = 280;
const DEFAULT_MAX_OUTPUT_SIZE = 1200;

export function ImageCropper({
  open,
  imageSrc,
  onClose,
  onCropComplete,
  aspectRatio, // undefined = freeform crop
  outputWidth,
  outputHeight,
  maxOutputSize = DEFAULT_MAX_OUTPUT_SIZE,
  title = 'Crop Image',
}: ImageCropperProps) {
  // Apply defaults only when aspectRatio is provided (fixed ratio mode)
  const effectiveOutputWidth = aspectRatio !== undefined ? (outputWidth ?? DEFAULT_OUTPUT_WIDTH) : outputWidth;
  const effectiveOutputHeight = aspectRatio !== undefined ? (outputHeight ?? DEFAULT_OUTPUT_HEIGHT) : outputHeight;
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const onCropChange = useCallback((location: { x: number; y: number }) => {
    setCrop(location);
  }, []);

  const onZoomChange = useCallback((newZoom: number) => {
    setZoom(newZoom);
  }, []);

  const onCropCompleteCallback = useCallback(
    (_croppedArea: Area, croppedAreaPixels: Area) => {
      setCroppedAreaPixels(croppedAreaPixels);
    },
    []
  );

  const handleConfirm = useCallback(async () => {
    if (!croppedAreaPixels) return;

    setIsProcessing(true);
    try {
      const croppedBlob = await getCroppedImg(
        imageSrc, 
        croppedAreaPixels, 
        effectiveOutputWidth, 
        effectiveOutputHeight,
        maxOutputSize
      );
      onCropComplete(croppedBlob);
      // Reset state
      setCrop({ x: 0, y: 0 });
      setZoom(1);
      setCroppedAreaPixels(null);
    } catch (error) {
      console.error('Failed to crop image:', error);
    } finally {
      setIsProcessing(false);
    }
  }, [croppedAreaPixels, imageSrc, onCropComplete, effectiveOutputWidth, effectiveOutputHeight, maxOutputSize]);

  const handleClose = useCallback(() => {
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    setCroppedAreaPixels(null);
    onClose();
  }, [onClose]);

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          bgcolor: '#1a1a1a',
          backgroundImage: 'none',
          border: '1px solid rgba(255, 255, 255, 0.1)',
        },
      }}
    >
      <DialogTitle
        sx={{
          color: 'white',
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
          pb: 2,
        }}
      >
        {title}
      </DialogTitle>

      <DialogContent sx={{ p: 0 }}>
        {/* Crop area */}
        <Box
          sx={{
            position: 'relative',
            width: '100%',
            height: 400,
            bgcolor: '#0a0a0a',
          }}
        >
          <Cropper
            image={imageSrc}
            crop={crop}
            zoom={zoom}
            aspect={aspectRatio}
            onCropChange={onCropChange}
            onZoomChange={onZoomChange}
            onCropComplete={onCropCompleteCallback}
            cropShape="rect"
            showGrid
            style={{
              containerStyle: {
                backgroundColor: '#0a0a0a',
              },
              cropAreaStyle: {
                border: '2px solid #1ed760',
              },
            }}
          />
        </Box>

        {/* Zoom control */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 2,
            px: 3,
            py: 2,
            borderTop: '1px solid rgba(255, 255, 255, 0.1)',
          }}
        >
          <ZoomOutIcon sx={{ color: 'rgba(255, 255, 255, 0.5)' }} />
          <Slider
            value={zoom}
            min={1}
            max={3}
            step={0.1}
            onChange={(_, value) => setZoom(value as number)}
            sx={{
              color: '#1ed760',
              '& .MuiSlider-thumb': {
                bgcolor: '#1ed760',
                '&:hover, &.Mui-focusVisible': {
                  boxShadow: '0 0 0 8px rgba(30, 215, 96, 0.16)',
                },
              },
              '& .MuiSlider-track': {
                bgcolor: '#1ed760',
              },
              '& .MuiSlider-rail': {
                bgcolor: 'rgba(255, 255, 255, 0.2)',
              },
            }}
          />
          <ZoomInIcon sx={{ color: 'rgba(255, 255, 255, 0.5)' }} />
        </Box>

        <Typography
          variant="caption"
          sx={{
            display: 'block',
            px: 3,
            pb: 2,
            color: 'rgba(255, 255, 255, 0.5)',
            textAlign: 'center',
          }}
        >
          Drag to reposition • Scroll or use slider to zoom
        </Typography>
      </DialogContent>

      <DialogActions
        sx={{
          borderTop: '1px solid rgba(255, 255, 255, 0.1)',
          px: 3,
          py: 2,
        }}
      >
        <Button
          onClick={handleClose}
          disabled={isProcessing}
          sx={{
            color: 'rgba(255, 255, 255, 0.7)',
            '&:hover': {
              bgcolor: 'rgba(255, 255, 255, 0.05)',
            },
          }}
        >
          Cancel
        </Button>
        <Button
          onClick={handleConfirm}
          variant="contained"
          disabled={isProcessing || !croppedAreaPixels}
          sx={{
            bgcolor: '#1ed760',
            color: 'black',
            fontWeight: 600,
            '&:hover': {
              bgcolor: '#1db954',
            },
            '&.Mui-disabled': {
              bgcolor: 'rgba(30, 215, 96, 0.3)',
              color: 'rgba(0, 0, 0, 0.5)',
            },
          }}
        >
          {isProcessing ? (
            <>
              <CircularProgress size={16} sx={{ mr: 1, color: 'inherit' }} />
              Processing...
            </>
          ) : (
            'Crop & Upload'
          )}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default ImageCropper;

