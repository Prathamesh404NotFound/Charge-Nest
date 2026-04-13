import React from 'react';
import { cn } from '@/lib/utils';

interface ResponsiveContainerProps {
  children: React.ReactNode;
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  as?: keyof JSX.IntrinsicElements;
}

const ResponsiveContainer: React.FC<ResponsiveContainerProps> = ({
  children,
  className = '',
  size = 'lg',
  as: Component = 'div',
  ...props
}) => {
  const sizeClasses = {
    sm: 'max-w-2xl',
    md: 'max-w-4xl',
    lg: 'max-w-6xl',
    xl: 'max-w-7xl',
    full: 'max-w-full'
  };

  const paddingClasses = {
    sm: 'px-4 sm:px-6',
    md: 'px-4 sm:px-6 lg:px-8',
    lg: 'px-4 sm:px-6 lg:px-8 xl:px-12',
    xl: 'px-4 sm:px-6 lg:px-8 xl:px-12',
    full: 'px-4 sm:px-6 lg:px-8 xl:px-12'
  };

  return (
    <Component
      className={cn(
        'mx-auto w-full',
        sizeClasses[size],
        paddingClasses[size],
        className
      )}
      {...props}
    >
      {children}
    </Component>
  );
};

export default ResponsiveContainer;
