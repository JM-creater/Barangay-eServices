import React from 'react';

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'text' | 'circular' | 'rectangular' | 'rounded';
  width?: string | number;
  height?: string | number;
  count?: number;
  className?: string;
  style?: React.CSSProperties;
}

export const Skeleton: React.FC<SkeletonProps> = ({
  variant = 'text',
  width,
  height,
  count = 1,
  className = '',
  style,
  ...rest
}) => {
  const getVariantClass = () => {
    switch (variant) {
      case 'circular':
        return 'skeleton-circular';
      case 'rounded':
        return 'skeleton-rounded';
      case 'rectangular':
        return '';
      case 'text':
      default:
        return 'skeleton-text';
    }
  };

  const computedStyle: React.CSSProperties = {
    width: width !== undefined ? (typeof width === 'number' ? `${width}px` : width) : undefined,
    height: height !== undefined ? (typeof height === 'number' ? `${height}px` : height) : undefined,
    ...style,
  };

  const renderSingle = (key?: number) => (
    <div
      key={key}
      className={`skeleton ${getVariantClass()} ${className}`.trim()}
      style={computedStyle}
      aria-hidden="true"
      {...rest}
    />
  );

  if (count <= 1) {
    return renderSingle();
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', width: computedStyle.width }}>
      {Array.from({ length: count }).map((_, idx) => renderSingle(idx))}
    </div>
  );
};
