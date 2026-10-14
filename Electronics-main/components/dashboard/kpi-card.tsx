'use client';

import { cn } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/card';
import type { LucideIcon } from 'lucide-react';

interface KpiCardProps {
  label: string;
  value: string | number;
  icon: LucideIcon;
  trend?: { value: string; positive: boolean };
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info' | 'primary';
  subtitle?: string;
}

const variantStyles: Record<string, { bg: string; text: string; iconBg: string }> = {
  default: { bg: 'bg-card', text: 'text-foreground', iconBg: 'bg-muted' },
  primary: { bg: 'bg-card', text: 'text-foreground', iconBg: 'bg-primary/10' },
  success: { bg: 'bg-card', text: 'text-foreground', iconBg: 'bg-success/10' },
  warning: { bg: 'bg-card', text: 'text-foreground', iconBg: 'bg-warning/10' },
  danger: { bg: 'bg-card', text: 'text-foreground', iconBg: 'bg-destructive/10' },
  info: { bg: 'bg-card', text: 'text-foreground', iconBg: 'bg-info/10' },
};

const iconColors: Record<string, string> = {
  default: 'text-muted-foreground',
  primary: 'text-primary',
  success: 'text-success',
  warning: 'text-warning',
  danger: 'text-destructive',
  info: 'text-info',
};

export function KpiCard({ label, value, icon: Icon, trend, variant = 'default', subtitle }: KpiCardProps) {
  const styles = variantStyles[variant];

  return (
    <Card className={cn(styles.bg, 'hover:shadow-md transition-shadow')}>
      <CardContent className="p-4 lg:p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex flex-col gap-1 min-w-0">
            <span className="text-xs font-medium text-muted-foreground truncate">{label}</span>
            <span className={cn('text-2xl font-bold tracking-tight', styles.text)}>{value}</span>
            {subtitle && <span className="text-xs text-muted-foreground">{subtitle}</span>}
            {trend && (
              <span className={cn(
                'flex items-center gap-1 text-xs font-medium',
                trend.positive ? 'text-success' : 'text-destructive'
              )}>
                {trend.positive ? '↑' : '↓'} {trend.value}
              </span>
            )}
          </div>
          <div className={cn('flex h-11 w-11 shrink-0 items-center justify-center rounded-lg', styles.iconBg)}>
            <Icon className={cn('h-5 w-5', iconColors[variant])} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
