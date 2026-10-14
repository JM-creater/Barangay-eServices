import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Crop, RotateCw, Check, X, ZoomIn, ZoomOut, Maximize2, Move } from 'lucide-react';
import { Button } from './Button';

export type AspectRatioMode = 'card' | 'square' | 'free';

interface ImageCropModalProps {
  isOpen: boolean;
  onClose: () => void;
  imageFile: File | null;
  onCropComplete: (croppedFile: File) => void;
  initialMode?: AspectRatioMode;
  title?: string;
  allowKeepOriginal?: boolean;
}

interface CropBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

type DragType = 'move' | 'nw' | 'ne' | 'sw' | 'se' | null;

export const ImageCropModal: React.FC<ImageCropModalProps> = ({
  isOpen,
  onClose,
  imageFile,
  onCropComplete,
  initialMode = 'card',
  title = 'Crop & Frame Document',
  allowKeepOriginal = true,
}) => {
  const [workingSrc, setWorkingSrc] = useState<string | null>(null);
  const [aspectMode, setAspectMode] = useState<AspectRatioMode>(initialMode);
  const [renderedSize, setRenderedSize] = useState<{ width: number; height: number }>({ width: 0, height: 0 });
  const [naturalSize, setNaturalSize] = useState<{ width: number; height: number }>({ width: 0, height: 0 });
  const [cropBox, setCropBox] = useState<CropBox>({ x: 0, y: 0, width: 0, height: 0 });

  const [dragType, setDragType] = useState<DragType>(null);
  const dragStartRef = useRef<{ clientX: number; clientY: number; box: CropBox }>({
    clientX: 0,
    clientY: 0,
    box: { x: 0, y: 0, width: 0, height: 0 },
  });

  const imgRef = useRef<HTMLImageElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Initialize or reset working image URL when imageFile or isOpen changes
  useEffect(() => {
    if (isOpen && imageFile) {
      setAspectMode(initialMode);
      const url = URL.createObjectURL(imageFile);
      setWorkingSrc(url);

      return () => {
        URL.revokeObjectURL(url);
      };
    } else {
      setWorkingSrc(null);
      setRenderedSize({ width: 0, height: 0 });
      setCropBox({ x: 0, y: 0, width: 0, height: 0 });
    }
  }, [isOpen, imageFile, initialMode]);

  useEffect(() => {
    if (isOpen) {
      document.body.classList.add('mobile-menu-active');
    } else {
      document.body.classList.remove('mobile-menu-active');
    }
    return () => {
      document.body.classList.remove('mobile-menu-active');
    };
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  // Compute standard aspect ratio multiplier
  const getRatio = useCallback((mode: AspectRatioMode): number | null => {
    if (mode === 'card') return 1.586; // ISO/IEC 7810 ID-1 standard Philippine Card
    if (mode === 'square') return 1.0; // 2x2 Formal ID portrait
    return null; // Freeform
  }, []);

  // Initialize crop box within rendered image boundaries
  const setupCropBox = useCallback((rW: number, rH: number, mode: AspectRatioMode) => {
    if (rW <= 0 || rH <= 0) return;
    const ratio = getRatio(mode) || 1.586;

    let targetW = rW * 0.85;
    let targetH = targetW / ratio;

    if (targetH > rH * 0.85) {
      targetH = rH * 0.85;
      targetW = targetH * ratio;
    }

    const x = Math.max(0, (rW - targetW) / 2);
    const y = Math.max(0, (rH - targetH) / 2);

    setCropBox({
      x: Math.round(x),
      y: Math.round(y),
      width: Math.round(targetW),
      height: Math.round(targetH),
    });
  }, [getRatio]);

  // Handle image load
  const handleImageLoaded = () => {
    if (!imgRef.current) return;
    const img = imgRef.current;
    const rW = img.clientWidth;
    const rH = img.clientHeight;
    setRenderedSize({ width: rW, height: rH });
    setNaturalSize({ width: img.naturalWidth, height: img.naturalHeight });
    setupCropBox(rW, rH, aspectMode);
  };

  // Switch aspect ratio mode
  const handleSwitchMode = (newMode: AspectRatioMode) => {
    setAspectMode(newMode);
    if (renderedSize.width > 0 && renderedSize.height > 0) {
      const ratio = getRatio(newMode);
      if (ratio !== null) {
        const centerX = cropBox.x + cropBox.width / 2;
        const centerY = cropBox.y + cropBox.height / 2;

        let newW = cropBox.width;
        let newH = newW / ratio;

        if (newH > renderedSize.height * 0.95) {
          newH = renderedSize.height * 0.95;
          newW = newH * ratio;
        }
        if (newW > renderedSize.width * 0.95) {
          newW = renderedSize.width * 0.95;
          newH = newW / ratio;
        }

        const newX = Math.max(0, Math.min(renderedSize.width - newW, centerX - newW / 2));
        const newY = Math.max(0, Math.min(renderedSize.height - newH, centerY - newH / 2));

        setCropBox({
          x: Math.round(newX),
          y: Math.round(newY),
          width: Math.round(newW),
          height: Math.round(newH),
        });
      }
    }
  };

  // Center / reset crop box
  const handleResetCenter = () => {
    if (renderedSize.width > 0 && renderedSize.height > 0) {
      setupCropBox(renderedSize.width, renderedSize.height, aspectMode);
    }
  };

  // Rotate image clockwise by 90 degrees
  const handleRotate90 = () => {
    if (!imgRef.current) return;
    const img = imgRef.current;

    const canvas = document.createElement('canvas');
    canvas.width = img.naturalHeight;
    canvas.height = img.naturalWidth;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.translate(canvas.width / 2, canvas.height / 2);
    ctx.rotate((90 * Math.PI) / 180);
    ctx.drawImage(img, -img.naturalWidth / 2, -img.naturalHeight / 2);

    const rotatedDataUrl = canvas.toDataURL('image/jpeg', 0.95);
    setWorkingSrc(rotatedDataUrl);
  };

  // Scale box up or down by factor (e.g. 1.1 or 0.9)
  const handleScaleBox = (factor: number) => {
    if (renderedSize.width <= 0 || renderedSize.height <= 0) return;
    const ratio = getRatio(aspectMode);

    let newW = cropBox.width * factor;
    let newH = ratio ? newW / ratio : cropBox.height * factor;

    // Boundary check
    if (newW > renderedSize.width) {
      newW = renderedSize.width;
      if (ratio) newH = newW / ratio;
    }
    if (newH > renderedSize.height) {
      newH = renderedSize.height;
      if (ratio) newW = newH * ratio;
    }
    if (newW < 40 || newH < 40) return;

    const centerX = cropBox.x + cropBox.width / 2;
    const centerY = cropBox.y + cropBox.height / 2;

    const newX = Math.max(0, Math.min(renderedSize.width - newW, centerX - newW / 2));
    const newY = Math.max(0, Math.min(renderedSize.height - newH, centerY - newH / 2));

    setCropBox({
      x: Math.round(newX),
      y: Math.round(newY),
      width: Math.round(newW),
      height: Math.round(newH),
    });
  };

  // Pointer drag start
  const handleStartDrag = (
    type: DragType,
    e: React.MouseEvent | React.TouchEvent
  ) => {
    e.stopPropagation();
    e.preventDefault();

    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

    dragStartRef.current = {
      clientX,
      clientY,
      box: { ...cropBox },
    };
    setDragType(type);
  };

  // Global pointer move listener
  useEffect(() => {
    if (!dragType) return;

    const onPointerMove = (e: MouseEvent | TouchEvent) => {
      const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
      const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

      const deltaX = clientX - dragStartRef.current.clientX;
      const deltaY = clientY - dragStartRef.current.clientY;
      const startBox = dragStartRef.current.box;
      const rW = renderedSize.width;
      const rH = renderedSize.height;
      const ratio = getRatio(aspectMode);

      if (dragType === 'move') {
        const nextX = Math.max(0, Math.min(rW - startBox.width, startBox.x + deltaX));
        const nextY = Math.max(0, Math.min(rH - startBox.height, startBox.y + deltaY));
        setCropBox((prev) => ({ ...prev, x: Math.round(nextX), y: Math.round(nextY) }));
        return;
      }

      // Handle corner resizing
      let nextX = startBox.x;
      let nextY = startBox.y;
      let nextW = startBox.width;
      let nextH = startBox.height;

      if (dragType === 'se') {
        nextW = Math.max(40, startBox.width + deltaX);
        if (ratio) {
          nextH = nextW / ratio;
        } else {
          nextH = Math.max(40, startBox.height + deltaY);
        }

        if (nextX + nextW > rW) {
          nextW = rW - nextX;
          if (ratio) nextH = nextW / ratio;
        }
        if (nextY + nextH > rH) {
          nextH = rH - nextY;
          if (ratio) nextW = nextH * ratio;
        }
      } else if (dragType === 'sw') {
        nextW = Math.max(40, startBox.width - deltaX);
        if (ratio) {
          nextH = nextW / ratio;
        } else {
          nextH = Math.max(40, startBox.height + deltaY);
        }

        nextX = startBox.x + (startBox.width - nextW);
        if (nextX < 0) {
          nextW += nextX;
          nextX = 0;
          if (ratio) nextH = nextW / ratio;
        }
        if (nextY + nextH > rH) {
          nextH = rH - nextY;
          if (ratio) {
            nextW = nextH * ratio;
            nextX = startBox.x + (startBox.width - nextW);
          }
        }
      } else if (dragType === 'ne') {
        nextW = Math.max(40, startBox.width + deltaX);
        if (ratio) {
          nextH = nextW / ratio;
        } else {
          nextH = Math.max(40, startBox.height - deltaY);
        }

        nextY = startBox.y + (startBox.height - nextH);
        if (nextY < 0) {
          nextH += nextY;
          nextY = 0;
          if (ratio) nextW = nextH * ratio;
        }
        if (nextX + nextW > rW) {
          nextW = rW - nextX;
          if (ratio) {
            nextH = nextW / ratio;
            nextY = startBox.y + (startBox.height - nextH);
          }
        }
      } else if (dragType === 'nw') {
        nextW = Math.max(40, startBox.width - deltaX);
        if (ratio) {
          nextH = nextW / ratio;
        } else {
          nextH = Math.max(40, startBox.height - deltaY);
        }

        nextX = startBox.x + (startBox.width - nextW);
        nextY = startBox.y + (startBox.height - nextH);

        if (nextX < 0) {
          nextW += nextX;
          nextX = 0;
          if (ratio) nextH = nextW / ratio;
        }
        if (nextY < 0) {
          nextH += nextY;
          nextY = 0;
          if (ratio) nextW = nextH * ratio;
        }
      }

      if (nextW >= 40 && nextH >= 40) {
        setCropBox({
          x: Math.round(nextX),
          y: Math.round(nextY),
          width: Math.round(nextW),
          height: Math.round(nextH),
        });
      }
    };

    const onPointerUp = () => {
      setDragType(null);
    };

    window.addEventListener('mousemove', onPointerMove);
    window.addEventListener('mouseup', onPointerUp);
    window.addEventListener('touchmove', onPointerMove, { passive: false });
    window.addEventListener('touchend', onPointerUp);
    window.addEventListener('blur', onPointerUp);

    return () => {
      window.removeEventListener('mousemove', onPointerMove);
      window.removeEventListener('mouseup', onPointerUp);
      window.removeEventListener('touchmove', onPointerMove);
      window.removeEventListener('touchend', onPointerUp);
      window.removeEventListener('blur', onPointerUp);
    };
  }, [dragType, renderedSize, aspectMode, getRatio]);

  // Execute high-resolution offscreen canvas crop
  const handleConfirmCrop = () => {
    if (!imgRef.current || renderedSize.width <= 0 || renderedSize.height <= 0) return;
    const img = imgRef.current;

    const scaleX = img.naturalWidth / renderedSize.width;
    const scaleY = img.naturalHeight / renderedSize.height;

    const sourceX = Math.max(0, Math.round(cropBox.x * scaleX));
    const sourceY = Math.max(0, Math.round(cropBox.y * scaleY));
    const sourceWidth = Math.min(img.naturalWidth - sourceX, Math.round(cropBox.width * scaleX));
    const sourceHeight = Math.min(img.naturalHeight - sourceY, Math.round(cropBox.height * scaleY));

    if (sourceWidth <= 10 || sourceHeight <= 10) return;

    const canvas = document.createElement('canvas');
    canvas.width = sourceWidth;
    canvas.height = sourceHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(
      img,
      sourceX,
      sourceY,
      sourceWidth,
      sourceHeight,
      0,
      0,
      sourceWidth,
      sourceHeight
    );

    canvas.toBlob(
      (blob) => {
        if (!blob) return;
        const originalBase = imageFile?.name
          ? imageFile.name.replace(/\.[^/.]+$/, '')
          : `document_${Date.now()}`;
        const fileName = `${originalBase}_cropped.jpg`;
        const croppedFile = new File([blob], fileName, {
          type: 'image/jpeg',
          lastModified: Date.now(),
        });

        onCropComplete(croppedFile);
        onClose();
      },
      'image/jpeg',
      0.95
    );
  };

  // Bypass cropping and use original file
  const handleKeepOriginal = () => {
    if (imageFile) {
      onCropComplete(imageFile);
    }
    onClose();
  };

  if (!isOpen || !workingSrc) return null;

  return (
    <div
      className="modal-overlay"
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.85)',
        backdropFilter: 'blur(5px)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 'clamp(0.5rem, 2vw, 1rem)',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '620px',
          backgroundColor: '#0f172a',
          borderRadius: '16px',
          border: '1px solid #334155',
          overflow: 'hidden',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.6)',
          display: 'flex',
          flexDirection: 'column',
          maxHeight: 'min(94vh, 94dvh)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Bar */}
        <div
          style={{
            padding: '0.75rem 1rem',
            borderBottom: '1px solid #1e293b',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            backgroundColor: '#0f172a',
            gap: '0.5rem',
            flexShrink: 0,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', minWidth: 0 }}>
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                backgroundColor: '#1e3a8a',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#60a5fa',
                flexShrink: 0,
              }}
            >
              <Crop size={18} />
            </div>
            <div style={{ minWidth: 0 }}>
              <h3
                style={{
                  fontSize: 'clamp(0.85rem, 2.8vw, 0.96rem)',
                  fontWeight: 700,
                  color: '#f8fafc',
                  margin: 0,
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
              >
                {title}
              </h3>
              <p
                style={{
                  fontSize: '0.72rem',
                  color: '#94a3b8',
                  margin: '2px 0 0 0',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
              >
                Drag the crop box to frame your document or 2x2 photo tightly
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              color: '#94a3b8',
              cursor: 'pointer',
              padding: '6px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: '6px',
              flexShrink: 0,
            }}
            title="Close"
          >
            <X size={20} />
          </button>
        </div>

        {/* Aspect Ratio Mode Selection Pills */}
        <div
          style={{
            padding: '0.45rem 1rem',
            backgroundColor: '#090d16',
            borderBottom: '1px solid #1e293b',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '0.4rem',
            flexWrap: 'wrap',
            flexShrink: 0,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '0.72rem', color: '#94a3b8', fontWeight: 600, marginRight: '2px' }}>
              Mode:
            </span>
            <button
              type="button"
              onClick={() => handleSwitchMode('card')}
              style={{
                padding: '4px 10px',
                borderRadius: '6px',
                fontSize: '0.75rem',
                fontWeight: 700,
                cursor: 'pointer',
                border: aspectMode === 'card' ? '1px solid #38bdf8' : '1px solid #334155',
                backgroundColor: aspectMode === 'card' ? '#0369a1' : '#1e293b',
                color: aspectMode === 'card' ? '#ffffff' : '#94a3b8',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                transition: 'all 0.15s ease',
              }}
            >
              <span>🪪 ID Card</span>
              <span style={{ opacity: 0.8, fontSize: '0.68rem' }}>(1.58:1)</span>
            </button>

            <button
              type="button"
              onClick={() => handleSwitchMode('square')}
              style={{
                padding: '4px 10px',
                borderRadius: '6px',
                fontSize: '0.75rem',
                fontWeight: 700,
                cursor: 'pointer',
                border: aspectMode === 'square' ? '1px solid #38bdf8' : '1px solid #334155',
                backgroundColor: aspectMode === 'square' ? '#0369a1' : '#1e293b',
                color: aspectMode === 'square' ? '#ffffff' : '#94a3b8',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                transition: 'all 0.15s ease',
              }}
            >
              <span>👤 2x2 Photo</span>
              <span style={{ opacity: 0.8, fontSize: '0.68rem' }}>(1:1)</span>
            </button>

            <button
              type="button"
              onClick={() => handleSwitchMode('free')}
              style={{
                padding: '4px 10px',
                borderRadius: '6px',
                fontSize: '0.75rem',
                fontWeight: 700,
                cursor: 'pointer',
                border: aspectMode === 'free' ? '1px solid #38bdf8' : '1px solid #334155',
                backgroundColor: aspectMode === 'free' ? '#0369a1' : '#1e293b',
                color: aspectMode === 'free' ? '#ffffff' : '#94a3b8',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                transition: 'all 0.15s ease',
              }}
            >
              <span>↔️ Freeform</span>
            </button>
          </div>

          {/* Transform Shortcuts */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <button
              type="button"
              onClick={handleRotate90}
              style={{
                padding: '4px 8px',
                borderRadius: '6px',
                fontSize: '0.72rem',
                fontWeight: 600,
                backgroundColor: '#1e293b',
                color: '#cbd5e1',
                border: '1px solid #334155',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
              }}
              title="Rotate Image 90° Clockwise"
            >
              <RotateCw size={13} />
              <span>Rotate 90°</span>
            </button>

            <button
              type="button"
              onClick={handleResetCenter}
              style={{
                padding: '4px 8px',
                borderRadius: '6px',
                fontSize: '0.72rem',
                fontWeight: 600,
                backgroundColor: '#1e293b',
                color: '#cbd5e1',
                border: '1px solid #334155',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
              }}
              title="Center Crop Box"
            >
              <Maximize2 size={13} />
              <span>Center</span>
            </button>
          </div>
        </div>

        {/* Interactive Workspace Area */}
        <div
          ref={containerRef}
          style={{
            position: 'relative',
            width: '100%',
            height: 'clamp(240px, 48vh, 390px)',
            backgroundColor: '#020617',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden',
            userSelect: 'none',
            touchAction: 'none',
            flex: '1 1 auto',
          }}
        >
          {/* Inner Image Container */}
          <div
            style={{
              position: 'relative',
              display: 'inline-block',
              lineHeight: 0,
            }}
          >
            <img
              ref={imgRef}
              src={workingSrc}
              alt="Crop specimen"
              onLoad={handleImageLoaded}
              style={{
                maxWidth: 'min(560px, 92vw)',
                maxHeight: 'clamp(230px, 46vh, 380px)',
                display: 'block',
                objectFit: 'contain',
                pointerEvents: 'none',
              }}
            />

            {/* Interactive Crop Box Overlay */}
            {renderedSize.width > 0 && cropBox.width > 0 && (
              <div
                style={{
                  position: 'absolute',
                  left: `${cropBox.x}px`,
                  top: `${cropBox.y}px`,
                  width: `${cropBox.width}px`,
                  height: `${cropBox.height}px`,
                  border: '2px solid #38bdf8',
                  borderRadius: aspectMode === 'square' ? '8px' : '6px',
                  boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.65)',
                  cursor: dragType === 'move' ? 'grabbing' : 'grab',
                  touchAction: 'none',
                  zIndex: 20,
                  boxSizing: 'border-box',
                }}
                onMouseDown={(e) => handleStartDrag('move', e)}
                onTouchStart={(e) => handleStartDrag('move', e)}
              >
                {/* 3x3 Rule-of-Thirds Grid */}
                <div
                  style={{
                    position: 'absolute',
                    top: '33.33%',
                    left: 0,
                    right: 0,
                    height: '1px',
                    backgroundColor: 'rgba(255, 255, 255, 0.25)',
                    pointerEvents: 'none',
                  }}
                />
                <div
                  style={{
                    position: 'absolute',
                    top: '66.66%',
                    left: 0,
                    right: 0,
                    height: '1px',
                    backgroundColor: 'rgba(255, 255, 255, 0.25)',
                    pointerEvents: 'none',
                  }}
                />
                <div
                  style={{
                    position: 'absolute',
                    left: '33.33%',
                    top: 0,
                    bottom: 0,
                    width: '1px',
                    backgroundColor: 'rgba(255, 255, 255, 0.25)',
                    pointerEvents: 'none',
                  }}
                />
                <div
                  style={{
                    position: 'absolute',
                    left: '66.66%',
                    top: 0,
                    bottom: 0,
                    width: '1px',
                    backgroundColor: 'rgba(255, 255, 255, 0.25)',
                    pointerEvents: 'none',
                  }}
                />

                {/* Center Move Indicator */}
                <div
                  style={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    backgroundColor: 'rgba(15, 23, 42, 0.75)',
                    padding: '3px 8px',
                    borderRadius: '9999px',
                    fontSize: '0.68rem',
                    fontWeight: 700,
                    color: '#bae6fd',
                    pointerEvents: 'none',
                    letterSpacing: '0.02em',
                    whiteSpace: 'nowrap',
                  }}
                >
                  <Move size={11} />
                  <span>
                    {aspectMode === 'card'
                      ? 'ID Card Frame'
                      : aspectMode === 'square'
                      ? '2x2 Photo Frame'
                      : 'Freeform Crop'}
                  </span>
                </div>

                {/* 4 Corner Resize Handles with Generous Touch Hit Areas */}
                {/* North-West */}
                <div
                  onMouseDown={(e) => handleStartDrag('nw', e)}
                  onTouchStart={(e) => handleStartDrag('nw', e)}
                  style={{
                    position: 'absolute',
                    top: '-9px',
                    left: '-9px',
                    width: '18px',
                    height: '18px',
                    backgroundColor: '#ffffff',
                    border: '2.5px solid #0284c7',
                    borderRadius: '4px',
                    cursor: 'nwse-resize',
                    zIndex: 30,
                    touchAction: 'none',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.4)',
                  }}
                />
                {/* North-East */}
                <div
                  onMouseDown={(e) => handleStartDrag('ne', e)}
                  onTouchStart={(e) => handleStartDrag('ne', e)}
                  style={{
                    position: 'absolute',
                    top: '-9px',
                    right: '-9px',
                    width: '18px',
                    height: '18px',
                    backgroundColor: '#ffffff',
                    border: '2.5px solid #0284c7',
                    borderRadius: '4px',
                    cursor: 'nesw-resize',
                    zIndex: 30,
                    touchAction: 'none',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.4)',
                  }}
                />
                {/* South-West */}
                <div
                  onMouseDown={(e) => handleStartDrag('sw', e)}
                  onTouchStart={(e) => handleStartDrag('sw', e)}
                  style={{
                    position: 'absolute',
                    bottom: '-9px',
                    left: '-9px',
                    width: '18px',
                    height: '18px',
                    backgroundColor: '#ffffff',
                    border: '2.5px solid #0284c7',
                    borderRadius: '4px',
                    cursor: 'nesw-resize',
                    zIndex: 30,
                    touchAction: 'none',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.4)',
                  }}
                />
                {/* South-East */}
                <div
                  onMouseDown={(e) => handleStartDrag('se', e)}
                  onTouchStart={(e) => handleStartDrag('se', e)}
                  style={{
                    position: 'absolute',
                    bottom: '-9px',
                    right: '-9px',
                    width: '18px',
                    height: '18px',
                    backgroundColor: '#ffffff',
                    border: '2.5px solid #0284c7',
                    borderRadius: '4px',
                    cursor: 'nwse-resize',
                    zIndex: 30,
                    touchAction: 'none',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.4)',
                  }}
                />
              </div>
            )}
          </div>
        </div>

        {/* Fine Adjustment Bar (+ / - Box Size) */}
        <div
          style={{
            padding: '0.45rem 1rem',
            backgroundColor: '#090d16',
            borderTop: '1px solid #1e293b',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontSize: '0.75rem',
            color: '#94a3b8',
            flexShrink: 0,
            flexWrap: 'wrap',
            gap: '0.4rem',
          }}
        >
          <span>Quick Frame Resize:</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <button
              type="button"
              onClick={() => handleScaleBox(0.9)}
              style={{
                padding: '3px 8px',
                borderRadius: '4px',
                backgroundColor: '#1e293b',
                color: '#cbd5e1',
                border: '1px solid #334155',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                fontSize: '0.72rem',
                touchAction: 'manipulation',
              }}
              title="Shrink Frame by 10%"
            >
              <ZoomOut size={12} /> Smaller
            </button>
            <button
              type="button"
              onClick={() => handleScaleBox(1.1)}
              style={{
                padding: '3px 8px',
                borderRadius: '4px',
                backgroundColor: '#1e293b',
                color: '#cbd5e1',
                border: '1px solid #334155',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                fontSize: '0.72rem',
                touchAction: 'manipulation',
              }}
              title="Expand Frame by 10%"
            >
              <ZoomIn size={12} /> Larger
            </button>
          </div>
        </div>

        {/* Modal Footer Actions */}
        <div
          style={{
            padding: '0.75rem 1rem',
            backgroundColor: '#0f172a',
            borderTop: '1px solid #1e293b',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '0.5rem',
            flexShrink: 0,
            flexWrap: 'wrap',
          }}
        >
          <div>
            {allowKeepOriginal ? (
              <Button
                variant="outline"
                size="sm"
                onClick={handleKeepOriginal}
                style={{ color: '#cbd5e1', borderColor: '#475569' }}
              >
                Keep Original
              </Button>
            ) : (
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                style={{ color: '#94a3b8' }}
              >
                Cancel
              </Button>
            )}
          </div>

          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              style={{ color: '#94a3b8' }}
            >
              Cancel
            </Button>
            <Button variant="primary" size="sm" onClick={handleConfirmCrop}>
              <Check size={14} /> Apply & Frame Crop
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
