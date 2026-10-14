import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import type { StockStatus } from '@/types/product';
import { getStockStatusLabel } from '@/lib/calculations';
import { CheckCircle2, AlertTriangle, XCircle } from 'lucide-react';

export function StockStatusBadge({ status, className }: { status: StockStatus; className?: string }) {
  const config = {
    in_stock: {
      className: 'bg-success/10 text-success border-success/20',
      icon: CheckCircle2,
    },
    low_stock: {
      className: 'bg-warning/10 text-warning border-warning/20',
      icon: AlertTriangle,
    },
    out_of_stock: {
      className: 'bg-destructive/10 text-destructive border-destructive/20',
      icon: XCircle,
    },
  };

  const { className: badgeClass, icon: Icon } = config[status];

  return (
    <Badge variant="outline" className={cn(badgeClass, 'gap-1', className)}>
      <Icon className="h-3 w-3" />
      {getStockStatusLabel(status)}
    </Badge>
  );
}
