import React from 'react';

interface LoadingSpinnerProps {
  message?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ message = 'Loading...' }) => {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '3rem 1rem',
        gap: '1rem',
      }}
    >
      <div
        style={{
          width: '36px',
          height: '36px',
          border: '3px solid #DDE3EA',
          borderTopColor: '#1E4E8C',
          borderRadius: '50%',
          animation: 'spin 0.8s linear infinite',
        }}
      />
      <p style={{ color: '#616E7C', fontSize: '0.925rem' }}>{message}</p>
    </div>
  );
};
