import React from 'react';
import { cn } from '@/lib/utils';

interface ResponsiveTableProps {
  children: React.ReactNode;
  className?: string;
}

const ResponsiveTable: React.FC<ResponsiveTableProps> = ({ children, className = '' }) => {
  return (
    <div className={cn('w-full overflow-x-auto rounded-lg border border-border', className)}>
      <table className="w-full min-w-[600px]">
        {children}
      </table>
    </div>
  );
};

interface ResponsiveTableHeaderProps {
  children: React.ReactNode;
  className?: string;
}

const ResponsiveTableHeader: React.FC<ResponsiveTableHeaderProps> = ({ children, className = '' }) => {
  return (
    <thead className={cn('bg-muted/50', className)}>
      <tr>{children}</tr>
    </thead>
  );
};

interface ResponsiveTableBodyProps {
  children: React.ReactNode;
  className?: string;
}

const ResponsiveTableBody: React.FC<ResponsiveTableBodyProps> = ({ children, className = '' }) => {
  return (
    <tbody className={cn('divide-y divide-border', className)}>
      {children}
    </tbody>
  );
};

interface ResponsiveTableRowProps {
  children: React.ReactNode;
  className?: string;
}

const ResponsiveTableRow: React.FC<ResponsiveTableRowProps> = ({ children, className = '' }) => {
  return (
    <tr className={cn('hover:bg-muted/30 transition-colors', className)}>
      {children}
    </tr>
  );
};

interface ResponsiveTableHeadProps {
  children: React.ReactNode;
  className?: string;
}

const ResponsiveTableHead: React.FC<ResponsiveTableHeadProps> = ({ children, className = '' }) => {
  return (
    <th className={cn(
      'px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider',
      className
    )}>
      {children}
    </th>
  );
};

interface ResponsiveTableCellProps {
  children: React.ReactNode;
  className?: string;
}

const ResponsiveTableCell: React.FC<ResponsiveTableCellProps> = ({ children, className = '' }) => {
  return (
    <td className={cn('px-4 py-3 text-sm', className)}>
      {children}
    </td>
  );
};

export {
  ResponsiveTable,
  ResponsiveTableHeader,
  ResponsiveTableBody,
  ResponsiveTableRow,
  ResponsiveTableHead,
  ResponsiveTableCell
};
