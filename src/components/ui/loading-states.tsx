import React from 'react';
import { Loader2, RefreshCw, AlertCircle, CheckCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function LoadingSpinner({ size = 'md', className }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
  };

  return (
    <div className={cn('animate-spin', sizeClasses[size], className)}>
      <Loader2 className="w-full h-full" />
    </div>
  );
}

interface LoadingButtonProps {
  children: React.ReactNode;
  loading?: boolean;
  disabled?: boolean;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function LoadingButton({ 
  children, 
  loading = false, 
  disabled = false, 
  className = '',
  size = 'md'
}: LoadingButtonProps) {
  return (
    <button
      className={cn(
        'relative inline-flex items-center justify-center rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed',
        {
          'px-3 py-2 text-sm': size === 'sm',
          'px-4 py-2 text-sm': size === 'md',
          'px-6 py-3 text-base': size === 'lg',
        },
        className
      )}
      disabled={disabled || loading}
    >
      {loading && (
        <LoadingSpinner size="sm" className="mr-2" />
      )}
      {children}
    </button>
  );
}

interface LoadingCardProps {
  title?: string;
  description?: string;
  className?: string;
  height?: 'sm' | 'md' | 'lg';
}

export function LoadingCard({ 
  title = 'Loading...', 
  description = 'Please wait', 
  className = '',
  height = 'md'
}: LoadingCardProps) {
  const heightClasses = {
    sm: 'h-32',
    md: 'h-48',
    lg: 'h-64',
  };

  return (
    <div className={cn('flex flex-col items-center justify-center', heightClasses[height], className)}>
      <LoadingSpinner size="lg" className="mb-4" />
      <div className="text-center">
        <p className="text-lg font-medium text-foreground">{title}</p>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
    </div>
  );
}

interface LoadingPageProps {
  title?: string;
  description?: string;
  className?: string;
}

export function LoadingPage({ 
  title = 'Loading...', 
  description = 'Please wait while we load your content', 
  className = ''
}: LoadingPageProps) {
  return (
    <div className={cn('min-h-screen flex items-center justify-center', className)}>
      <div className="text-center space-y-4">
        <LoadingSpinner size="lg" />
        <div>
          <h1 className="text-2xl font-bold text-foreground">{title}</h1>
          <p className="text-muted-foreground">{description}</p>
        </div>
      </div>
    </div>
  );
}

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
}

export function EmptyState({ 
  icon, 
  title, 
  description, 
  action, 
  className = ''
}: EmptyStateProps) {
  return (
    <div className={cn('flex flex-col items-center justify-center py-12 text-center', className)}>
      <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
        {icon || <AlertCircle className="w-8 h-8 text-muted-foreground" />}
      </div>
      <h3 className="text-lg font-semibold text-foreground mb-2">{title}</h3>
      {description && (
        <p className="text-muted-foreground mb-6 max-w-md">{description}</p>
      )}
      {action && (
        <button
          onClick={action.onClick}
          className="px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
        >
          {action.label}
        </button>
      )}
    </div>
  );
}

interface SuccessStateProps {
  title?: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
}

export function SuccessState({ 
  title = 'Success!', 
  description = 'Operation completed successfully', 
  action, 
  className = ''
}: SuccessStateProps) {
  return (
    <div className={cn('flex flex-col items-center justify-center py-12 text-center', className)}>
      <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mb-4">
        <CheckCircle className="w-8 h-8 text-green-600" />
      </div>
      <h3 className="text-lg font-semibold text-foreground mb-2">{title}</h3>
      {description && (
        <p className="text-muted-foreground mb-6 max-w-md">{description}</p>
      )}
      {action && (
        <button
          onClick={action.onClick}
          className="px-4 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700 transition-colors"
        >
          {action.label}
        </button>
      )}
    </div>
  );
}

interface ErrorStateProps {
  title?: string;
  description?: string;
  error?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
}

export function ErrorState({ 
  title = 'Error', 
  description = 'Something went wrong', 
  error,
  action, 
  className = ''
}: ErrorStateProps) {
  return (
    <div className={cn('flex flex-col items-center justify-center py-12 text-center', className)}>
      <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mb-4">
        <AlertCircle className="w-8 h-8 text-red-600" />
      </div>
      <h3 className="text-lg font-semibold text-foreground mb-2">{title}</h3>
      <p className="text-muted-foreground mb-4 max-w-md">{description}</p>
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3 mb-6 max-w-md">
          <p className="text-sm text-red-800 dark:text-red-200 font-mono">{error}</p>
        </div>
      )}
      {action && (
        <button
          onClick={action.onClick}
          className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 transition-colors"
        >
          {action.label}
        </button>
      )}
    </div>
  );
}

interface SkeletonProps {
  className?: string;
  lines?: number;
  height?: string;
}

export function Skeleton({ className = '', lines = 3, height = 'h-4' }: SkeletonProps) {
  return (
    <div className={cn('space-y-2', className)}>
      {Array.from({ length: lines }).map((_, index) => (
        <div
          key={index}
          className={cn(
            'bg-muted rounded animate-pulse',
            height
          )}
          style={{
            animationDelay: `${index * 0.1}s`,
          }}
        />
      ))}
    </div>
  );
}

interface SkeletonCardProps {
  className?: string;
  height?: string;
}

export function SkeletonCard({ className = '', height = 'h-48' }: SkeletonCardProps) {
  return (
    <div className={cn('rounded-lg bg-card border border-border p-4', className)}>
      <div className="animate-pulse">
        <div className={cn('h-4 bg-muted rounded mb-3')} />
        <div className={cn('h-3 bg-muted rounded mb-2 w-3/4')} />
        <div className={cn('h-3 bg-muted rounded mb-2 w-1/2')} />
        <div className={cn(height, 'bg-muted rounded')} />
      </div>
    </div>
  );
}

interface LoadingOverlayProps {
  isLoading: boolean;
  children: React.ReactNode;
  className?: string;
}

export function LoadingOverlay({ isLoading, children, className = '' }: LoadingOverlayProps) {
  return (
    <div className={cn('relative', className)}>
      {children}
      {isLoading && (
        <div className="absolute inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50">
          <LoadingSpinner size="lg" />
        </div>
      )}
    </div>
  );
}

interface ProgressBarProps {
  progress: number;
  className?: string;
  showPercentage?: boolean;
}

export function ProgressBar({ progress, className = '', showPercentage = false }: ProgressBarProps) {
  return (
    <div className={cn('w-full', className)}>
      <div className="flex items-center justify-between mb-1">
        {showPercentage && (
          <span className="text-sm text-muted-foreground">{Math.round(progress)}%</span>
        )}
      </div>
      <div className="w-full bg-muted rounded-full h-2">
        <div
          className="bg-primary h-2 rounded-full transition-all duration-300 ease-out"
          style={{ width: `${Math.min(progress, 100)}%` }}
        />
      </div>
    </div>
  );
}

interface RetryButtonProps {
  onRetry: () => void;
  disabled?: boolean;
  className?: string;
}

export function RetryButton({ onRetry, disabled = false, className = '' }: RetryButtonProps) {
  return (
    <button
      onClick={onRetry}
      disabled={disabled}
      className={cn(
        'inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-border bg-background hover:bg-muted transition-colors',
        disabled && 'opacity-50 cursor-not-allowed',
        className
      )}
    >
      <RefreshCw className="w-4 h-4" />
      Retry
    </button>
  );
}
