import React from 'react';
import { cn } from '@/lib/utils';

interface ResponsiveGridProps {
  children: React.ReactNode;
  className?: string;
  cols?: {
    default?: number;
    sm?: number;
    md?: number;
    lg?: number;
    xl?: number;
    '2xl'?: number;
  };
  gap?: {
    default?: string;
    sm?: string;
    md?: string;
    lg?: string;
    xl?: string;
    '2xl'?: string;
  };
}

const ResponsiveGrid: React.FC<ResponsiveGridProps> = ({
  children,
  className = '',
  cols = {
    default: 1,
    sm: 1,
    md: 2,
    lg: 3,
    xl: 4,
    '2xl': 4
  },
  gap = {
    default: 'gap-4',
    sm: 'gap-4',
    md: 'gap-6',
    lg: 'gap-6',
    xl: 'gap-8',
    '2xl': 'gap-8'
  }
}) => {
  const gridCols = cn(
    cols.default && `grid-cols-${cols.default}`,
    cols.sm && `sm:grid-cols-${cols.sm}`,
    cols.md && `md:grid-cols-${cols.md}`,
    cols.lg && `lg:grid-cols-${cols.lg}`,
    cols.xl && `xl:grid-cols-${cols.xl}`,
    cols['2xl'] && `2xl:grid-cols-${cols['2xl']}`
  );

  const gridGap = cn(
    gap.default,
    gap.sm && `sm:${gap.sm}`,
    gap.md && `md:${gap.md}`,
    gap.lg && `lg:${gap.lg}`,
    gap.xl && `xl:${gap.xl}`,
    gap['2xl'] && `2xl:${gap['2xl']}`
  );

  return (
    <div className={cn('grid', gridCols, gridGap, className)}>
      {children}
    </div>
  );
};

export default ResponsiveGrid;
