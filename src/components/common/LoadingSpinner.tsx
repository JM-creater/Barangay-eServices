import React from 'react';
import { Loader2 } from 'lucide-react';

interface LoadingSpinnerProps {
  message?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  message = 'Loading...',
  size = 'md',
}) => {
  const pixelSize = size === 'sm' ? 24 : size === 'lg' ? 48 : 36;

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: size === 'sm' ? '1rem' : '2.5rem 1rem',
        gap: '0.75rem',
      }}
    >
      <Loader2
        className="animate-spin"
        size={pixelSize}
        color="#1E4E8C"
        style={{ strokeWidth: 2.25 }}
      />
      {message && (
        <p style={{ color: '#616E7C', fontSize: size === 'sm' ? '0.825rem' : '0.925rem', fontWeight: 500 }}>
          {message}
        </p>
      )}
    </div>
  );
};
