import React from 'react';
import { REQUEST_STATUS_CONFIG } from '../../utils/constants';

interface BadgeProps {
  status?: string;
  variant?: 'primary' | 'success' | 'warning' | 'danger' | 'info' | 'neutral';
  children?: React.ReactNode;
}

export const Badge: React.FC<BadgeProps> = ({ status, variant = 'neutral', children }) => {
  if (status && REQUEST_STATUS_CONFIG[status]) {
    const config = REQUEST_STATUS_CONFIG[status];
    return (
      <span
        className="badge"
        style={{
          color: config.color,
          backgroundColor: config.bg,
          border: `1px solid ${config.border}`,
        }}
      >
        <span
          style={{
            width: '6px',
            height: '6px',
            borderRadius: '50%',
            backgroundColor: config.color,
          }}
        />
        {config.label}
      </span>
    );
  }

  const colorStyles: Record<string, { color: string; bg: string; border: string }> = {
    primary: { color: '#1E4E8C', bg: '#eff5fc', border: '#bcd5f0' },
    success: { color: '#2E8B57', bg: '#edf7f2', border: '#a8dfc1' },
    warning: { color: '#9e7500', bg: '#fef9e8', border: '#fae49d' },
    danger: { color: '#D64545', bg: '#fdf2f2', border: '#f8c0c0' },
    info: { color: '#3B82C4', bg: '#f0f6fc', border: '#b8d7f4' },
    neutral: { color: '#616E7C', bg: '#f5f7fa', border: '#dde3ea' },
  };

  const style = colorStyles[variant] || colorStyles.neutral;

  return (
    <span
      className="badge"
      style={{
        color: style.color,
        backgroundColor: style.bg,
        border: `1px solid ${style.border}`,
      }}
    >
      {children}
    </span>
  );
};
