import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import type { PurchaseOrderStatus } from '@/types/purchase';
import { CheckCircle2, Clock, FileEdit, PackageCheck, Truck, XCircle, Archive } from 'lucide-react';

const config: Record<PurchaseOrderStatus, { className: string; icon: typeof Clock; label: string }> = {
  draft: { className: 'bg-muted text-muted-foreground border-border', icon: FileEdit, label: 'Draft' },
  pending: { className: 'bg-warning/10 text-warning border-warning/20', icon: Clock, label: 'Pending' },
  approved: { className: 'bg-info/10 text-info border-info/20', icon: CheckCircle2, label: 'Approved' },
  ordered: { className: 'bg-primary/10 text-primary border-primary/20', icon: Truck, label: 'Ordered' },
  partially_received: { className: 'bg-accent/20 text-accent-foreground border-accent/30', icon: PackageCheck, label: 'Partially Received' },
  received: { className: 'bg-success/10 text-success border-success/20', icon: CheckCircle2, label: 'Received' },
  cancelled: { className: 'bg-destructive/10 text-destructive border-destructive/20', icon: XCircle, label: 'Cancelled' },
};

export function POStatusBadge({ status }: { status: PurchaseOrderStatus }) {
  const { className: badgeClass, icon: Icon, label } = config[status];
  return (
    <Badge variant="outline" className={cn(badgeClass, 'gap-1 whitespace-nowrap')}>
      <Icon className="h-3 w-3" />
      {label}
    </Badge>
  );
}
