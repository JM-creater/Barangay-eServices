import React, { useState, useEffect, useRef } from 'react';
import { Camera, RotateCcw, Check, X, AlertCircle, FlipHorizontal } from 'lucide-react';
import { Button } from './Button';

interface CameraCaptureModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCapture: (file: File) => void;
  title?: string;
  guideMode?: 'card' | 'portrait_square' | 'general';
}

export const CameraCaptureModal: React.FC<CameraCaptureModalProps> = ({
  isOpen,
  onClose,
  onCapture,
  title = 'Take Photo with Camera',
  guideMode = 'card',
}) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const guideBoxRef = useRef<HTMLDivElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const [hasMultipleCameras, setHasMultipleCameras] = useState<boolean>(false);
  const [activeGuideMode, setActiveGuideMode] = useState<'card' | 'portrait_square' | 'general'>(guideMode);

  useEffect(() => {
    setActiveGuideMode(guideMode);
  }, [guideMode]);

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
        stopStream();
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

  // Stop camera tracks helper
  const stopStream = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => {
        try {
          track.stop();
        } catch {
          // Ignore track stop errors
        }
      });
      streamRef.current = null;
    }
  };

  // Start media stream
  const startCamera = async (mode: 'environment' | 'user') => {
    stopStream();
    setError(null);
    setLoading(true);

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setError('Camera access is not supported by your browser. Please upload a file instead.');
      setLoading(false);
      return;
    }

    try {
      // Check for available video devices
      try {
        const devices = await navigator.mediaDevices.enumerateDevices();
        const videoDevices = devices.filter((d) => d.kind === 'videoinput');
        setHasMultipleCameras(videoDevices.length > 1);
      } catch {
        // Non-blocking device enumeration
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: mode },
          width: { ideal: 1920 },
          height: { ideal: 1080 },
        },
        audio: false,
      });

      streamRef.current = stream;

      if (videoRef.current) {
        const video = videoRef.current;
        video.srcObject = stream;
        video.play().catch(() => {});
        video.onloadedmetadata = () => {
          video.play().catch(() => {});
          setLoading(false);
        };
        if (video.readyState >= 1) {
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    } catch (err: any) {
      setLoading(false);
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setError('Camera permission was denied. Please allow camera permissions in your browser or choose a file instead.');
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        setError('No camera was detected on this device. Please upload a document file instead.');
      } else {
        setError('Unable to access camera: ' + (err.message || 'Please check your camera connection or upload a file.'));
      }
    }
  };

  // Initialize and clean up camera stream on open/close
  useEffect(() => {
    if (isOpen) {
      setCapturedImage(null);
      setError(null);
      startCamera(facingMode);
    } else {
      stopStream();
      setCapturedImage(null);
      setError(null);
    }

    return () => {
      stopStream();
    };
  }, [isOpen]);

  // Flip camera between front/back
  const handleToggleCamera = () => {
    const nextMode = facingMode === 'environment' ? 'user' : 'environment';
    setFacingMode(nextMode);
    startCamera(nextMode);
  };

  // Capture snapshot from current video frame auto-cropped to the viewfinder guide box
  const handleCaptureSnapshot = () => {
    const video = videoRef.current;
    if (!video || video.videoWidth === 0 || video.videoHeight === 0) {
      setError('Camera is not ready yet. Please wait a moment.');
      return;
    }

    const videoWidth = video.videoWidth;
    const videoHeight = video.videoHeight;
    const container = containerRef.current;
    const guideBox = guideBoxRef.current;

    let sourceX = 0;
    let sourceY = 0;
    let sourceWidth = videoWidth;
    let sourceHeight = videoHeight;

    if (container && guideBox) {
      const containerRect = container.getBoundingClientRect();
      const boxRect = guideBox.getBoundingClientRect();

      const containerWidth = containerRect.width;
      const containerHeight = containerRect.height;

      if (containerWidth > 0 && containerHeight > 0) {
        // Uniform object-fit: cover scaling factor
        const scale = Math.max(containerWidth / videoWidth, containerHeight / videoHeight);
        const renderedVideoWidth = videoWidth * scale;
        const renderedVideoHeight = videoHeight * scale;

        // Video element is centered within the container:
        const videoOffsetX = (containerWidth - renderedVideoWidth) / 2;
        const videoOffsetY = (containerHeight - renderedVideoHeight) / 2;

        // Position of the guide box relative to the container:
        const boxRelX = boxRect.left - containerRect.left;
        const boxRelY = boxRect.top - containerRect.top;
        const boxWidth = boxRect.width;
        const boxHeight = boxRect.height;

        // Position of the guide box relative to the scaled video:
        const videoCropX = boxRelX - videoOffsetX;
        const videoCropY = boxRelY - videoOffsetY;

        // Convert scaled video coordinates back to native video pixel coordinates:
        const calculatedSourceX = videoCropX / scale;
        const calculatedSourceY = videoCropY / scale;
        const calculatedSourceWidth = boxWidth / scale;
        const calculatedSourceHeight = boxHeight / scale;

        // Boundary safety clamps
        sourceX = Math.max(0, Math.min(videoWidth - 10, calculatedSourceX));
        sourceY = Math.max(0, Math.min(videoHeight - 10, calculatedSourceY));
        sourceWidth = Math.min(videoWidth - sourceX, Math.max(20, calculatedSourceWidth));
        sourceHeight = Math.min(videoHeight - sourceY, Math.max(20, calculatedSourceHeight));
      }
    } else {
      // Fallback: center crop with target aspect ratio
      const targetRatio = activeGuideMode === 'portrait_square' ? 1.0 : 1.586;
      let fallbackWidth = videoWidth * 0.78;
      let fallbackHeight = fallbackWidth / targetRatio;
      if (fallbackHeight > videoHeight * 0.85) {
        fallbackHeight = videoHeight * 0.85;
        fallbackWidth = fallbackHeight * targetRatio;
      }
      sourceX = (videoWidth - fallbackWidth) / 2;
      sourceY = (videoHeight - fallbackHeight) / 2;
      sourceWidth = fallbackWidth;
      sourceHeight = fallbackHeight;
    }

    const canvas = document.createElement('canvas');
    canvas.width = Math.round(sourceWidth);
    canvas.height = Math.round(sourceHeight);
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.drawImage(
      video,
      Math.round(sourceX),
      Math.round(sourceY),
      Math.round(sourceWidth),
      Math.round(sourceHeight),
      0,
      0,
      canvas.width,
      canvas.height
    );

    const dataUrl = canvas.toDataURL('image/jpeg', 0.95);
    setCapturedImage(dataUrl);
  };

  // Retake photo
  const handleRetake = () => {
    setCapturedImage(null);
    setError(null);

    const currentStream = streamRef.current;
    const hasLiveTracks =
      currentStream &&
      currentStream.getVideoTracks().length > 0 &&
      currentStream.getVideoTracks().some((t) => t.readyState === 'live');

    if (hasLiveTracks && videoRef.current) {
      if (videoRef.current.srcObject !== currentStream) {
        videoRef.current.srcObject = currentStream;
      }
      videoRef.current.play().catch(() => {});
    } else {
      startCamera(facingMode);
    }
  };

  // Confirm photo and create File object
  const handleConfirmPhoto = async () => {
    if (!capturedImage) return;

    try {
      const res = await fetch(capturedImage);
      const blob = await res.blob();
      const fileName = `camera_doc_${Date.now()}.jpg`;
      const file = new File([blob], fileName, { type: 'image/jpeg', lastModified: Date.now() });

      stopStream();
      onCapture(file);
      onClose();
    } catch {
      setError('Failed to process captured photo. Please try retaking.');
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="modal-overlay"
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.75)',
        backdropFilter: 'blur(4px)',
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
          maxWidth: '560px',
          backgroundColor: '#0f172a',
          borderRadius: '16px',
          border: '1px solid #334155',
          overflow: 'hidden',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
          display: 'flex',
          flexDirection: 'column',
          maxHeight: 'min(94vh, 94dvh)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
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
              <Camera size={18} />
            </div>
            <div style={{ minWidth: 0 }}>
              <h3
                style={{
                  fontSize: 'clamp(0.85rem, 2.8vw, 0.95rem)',
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
                Position your document or ID clearly inside the frame
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              stopStream();
              onClose();
            }}
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

        {/* Framing Mode Switcher Bar */}
        {!capturedImage && (
          <div
            style={{
              padding: '0.45rem 1rem',
              backgroundColor: '#090d16',
              borderBottom: '1px solid #1e293b',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              flexWrap: 'wrap',
              flexShrink: 0,
            }}
          >
            <span style={{ fontSize: '0.72rem', color: '#94a3b8', fontWeight: 600 }}>Framing:</span>
            <button
              type="button"
              onClick={() => setActiveGuideMode('card')}
              style={{
                padding: '3px 8px',
                borderRadius: '6px',
                fontSize: '0.74rem',
                fontWeight: 700,
                cursor: 'pointer',
                border: activeGuideMode === 'card' ? '1px solid #38bdf8' : '1px solid #334155',
                backgroundColor: activeGuideMode === 'card' ? '#0369a1' : '#1e293b',
                color: activeGuideMode === 'card' ? '#ffffff' : '#94a3b8',
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
              onClick={() => setActiveGuideMode('portrait_square')}
              style={{
                padding: '3px 8px',
                borderRadius: '6px',
                fontSize: '0.74rem',
                fontWeight: 700,
                cursor: 'pointer',
                border: activeGuideMode === 'portrait_square' ? '1px solid #38bdf8' : '1px solid #334155',
                backgroundColor: activeGuideMode === 'portrait_square' ? '#0369a1' : '#1e293b',
                color: activeGuideMode === 'portrait_square' ? '#ffffff' : '#94a3b8',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                transition: 'all 0.15s ease',
              }}
            >
              <span>👤 2x2 Photo</span>
              <span style={{ opacity: 0.8, fontSize: '0.68rem' }}>(1:1)</span>
            </button>
          </div>
        )}

        {/* Viewfinder / Capture Content Area */}
        <div
          ref={containerRef}
          style={{
            position: 'relative',
            width: '100%',
            height: 'clamp(260px, 48vh, 400px)',
            backgroundColor: '#020617',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden',
            flex: '1 1 auto',
          }}
        >
          {error ? (
            <div
              style={{
                padding: '2rem',
                textAlign: 'center',
                maxWidth: '400px',
                color: '#f87171',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '0.75rem',
              }}
            >
              <AlertCircle size={36} color="#ef4444" />
              <div style={{ fontSize: '0.9rem', fontWeight: 600 }}>{error}</div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  stopStream();
                  onClose();
                }}
                style={{ marginTop: '0.5rem', color: '#cbd5e1', borderColor: '#475569' }}
              >
                Close & Use File Upload
              </Button>
            </div>
          ) : (
            <>
              {/* Always retain <video> in DOM to prevent MediaStream detachment and black screen on retake */}
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  display: capturedImage ? 'none' : 'block',
                }}
              />

              {/* Captured Snapshot Preview */}
              {capturedImage && (
                <div style={{ width: '100%', height: '100%', position: 'relative' }}>
                  <img
                    src={capturedImage}
                    alt="Captured document"
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'contain',
                      backgroundColor: '#020617',
                    }}
                  />
                  <div
                    style={{
                      position: 'absolute',
                      top: '12px',
                      left: '12px',
                      backgroundColor: 'rgba(15, 23, 42, 0.85)',
                      padding: '4px 10px',
                      borderRadius: '9999px',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      color: '#4ade80',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                    }}
                  >
                    <Check size={13} /> Document Auto-Cropped & Ready
                  </div>
                </div>
              )}

              {loading && !capturedImage && (
                <div
                  style={{
                    position: 'absolute',
                    inset: 0,
                    backgroundColor: '#020617',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#94a3b8',
                    fontSize: '0.85rem',
                  }}
                >
                  Starting camera...
                </div>
              )}

              {/* Document Framing Guide Overlay */}
              {!loading && !capturedImage && (
                <div
                  style={{
                    position: 'absolute',
                    inset: 0,
                    pointerEvents: 'none',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: 'clamp(0.5rem, 3vw, 1.5rem)',
                    boxSizing: 'border-box',
                  }}
                >
                  <div
                    ref={guideBoxRef}
                    style={{
                      width: activeGuideMode === 'portrait_square' ? 'min(230px, 68vw)' : 'min(440px, 86vw)',
                      aspectRatio: activeGuideMode === 'portrait_square' ? '1 / 1' : '1.586 / 1',
                      maxHeight: 'min(270px, 40vh)',
                      border: '2px dashed rgba(255, 255, 255, 0.9)',
                      borderRadius: activeGuideMode === 'portrait_square' ? '12px' : '14px',
                      boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.45)',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      padding: 'clamp(8px, 2vw, 12px)',
                      position: 'relative',
                      transition: 'all 0.2s ease',
                      boxSizing: 'border-box',
                    }}
                  >
                    {/* Corner Alignment Brackets */}
                    <div style={{ position: 'absolute', top: '-2px', left: '-2px', width: '16px', height: '16px', borderTop: '3px solid #38bdf8', borderLeft: '3px solid #38bdf8', borderTopLeftRadius: '6px' }} />
                    <div style={{ position: 'absolute', top: '-2px', right: '-2px', width: '16px', height: '16px', borderTop: '3px solid #38bdf8', borderRight: '3px solid #38bdf8', borderTopRightRadius: '6px' }} />
                    <div style={{ position: 'absolute', bottom: '-2px', left: '-2px', width: '16px', height: '16px', borderBottom: '3px solid #38bdf8', borderLeft: '3px solid #38bdf8', borderBottomLeftRadius: '6px' }} />
                    <div style={{ position: 'absolute', bottom: '-2px', right: '-2px', width: '16px', height: '16px', borderBottom: '3px solid #38bdf8', borderRight: '3px solid #38bdf8', borderBottomRightRadius: '6px' }} />

                    <div
                      style={{
                        fontSize: '0.72rem',
                        fontWeight: 700,
                        color: 'rgba(255, 255, 255, 0.95)',
                        textShadow: '0 1px 3px rgba(0,0,0,0.9)',
                        textAlign: 'center',
                        letterSpacing: '0.02em',
                      }}
                    >
                      {activeGuideMode === 'portrait_square'
                        ? 'Align 2x2 Photo Inside'
                        : 'Align Government ID or Document Inside'}
                    </div>

                    <div
                      style={{
                        fontSize: '0.66rem',
                        fontWeight: 600,
                        color: '#bae6fd',
                        textShadow: '0 1px 3px rgba(0,0,0,0.9)',
                        textAlign: 'center',
                      }}
                    >
                      Auto-crops to frame on capture • Hold steady
                    </div>
                  </div>
                </div>
              )}

              {/* Flip camera toggle button if available */}
              {hasMultipleCameras && !loading && !capturedImage && (
                <button
                  type="button"
                  onClick={handleToggleCamera}
                  style={{
                    position: 'absolute',
                    top: '12px',
                    right: '12px',
                    backgroundColor: 'rgba(15, 23, 42, 0.75)',
                    border: '1px solid #334155',
                    borderRadius: '8px',
                    color: '#f8fafc',
                    padding: '6px 10px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    fontSize: '0.72rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                  title="Switch camera"
                >
                  <FlipHorizontal size={14} /> Flip
                </button>
              )}
            </>
          )}
        </div>

        {/* Modal Controls / Footer */}
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
          }}
        >
          {capturedImage ? (
            <div style={{ display: 'flex', width: '100%', gap: '0.5rem', justifyContent: 'space-between' }}>
              <Button
                variant="outline"
                size="sm"
                onClick={handleRetake}
                style={{ color: '#e2e8f0', borderColor: '#475569', flex: '1 1 auto' }}
              >
                <RotateCcw size={14} /> Retake
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={handleConfirmPhoto}
                style={{ flex: '1 1 auto' }}
              >
                <Check size={14} /> Use This Photo
              </Button>
            </div>
          ) : (
            <>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  stopStream();
                  onClose();
                }}
                style={{ color: '#94a3b8' }}
              >
                Cancel
              </Button>

              <button
                type="button"
                disabled={loading || Boolean(error)}
                onClick={handleCaptureSnapshot}
                style={{
                  width: '54px',
                  height: '54px',
                  borderRadius: '50%',
                  backgroundColor: loading || Boolean(error) ? '#475569' : '#ffffff',
                  border: '4px solid #1e4e8c',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: loading || Boolean(error) ? 'not-allowed' : 'pointer',
                  boxShadow: '0 4px 14px 0 rgba(0, 118, 255, 0.39)',
                  transition: 'transform 0.1s ease',
                }}
                title="Capture Photo"
              >
                <div
                  style={{
                    width: '38px',
                    height: '38px',
                    borderRadius: '50%',
                    backgroundColor: '#1e4e8c',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#ffffff',
                  }}
                >
                  <Camera size={20} />
                </div>
              </button>

              <div style={{ width: '60px' }} />
            </>
          )}
        </div>
      </div>
    </div>
  );
};
