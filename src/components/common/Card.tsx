import React from 'react';

interface CardProps {
  title?: React.ReactNode;
  subtitle?: React.ReactNode;
  actions?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  bodyStyle?: React.CSSProperties;
  bodyClassName?: string;
}

export const Card: React.FC<CardProps> = ({
  title,
  subtitle,
  actions,
  children,
  className = '',
  style,
  bodyStyle,
  bodyClassName = '',
}) => {
  return (
    <div className={`card ${className}`} style={style}>
      {(title || subtitle || actions) && (
        <div className="card-header">
          <div>
            {title && <h3 style={{ fontSize: '1.15rem', color: '#0f172a' }}>{title}</h3>}
            {subtitle && (
              <p style={{ fontSize: '0.875rem', color: '#64748b', marginTop: '0.2rem' }}>
                {subtitle}
              </p>
            )}
          </div>
          {actions && <div>{actions}</div>}
        </div>
      )}
      <div className={`card-body ${bodyClassName}`.trim()} style={bodyStyle}>
        {children}
      </div>
    </div>
  );
};
