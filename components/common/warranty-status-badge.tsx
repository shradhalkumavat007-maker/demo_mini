import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import type { WarrantyStatus } from '@/types/warranty';
import { getWarrantyStatusLabel } from '@/lib/calculations';
import { ShieldCheck, ShieldAlert, ShieldX } from 'lucide-react';

export function WarrantyStatusBadge({ status }: { status: WarrantyStatus }) {
  const config = {
    active: { className: 'bg-success/10 text-success border-success/20', icon: ShieldCheck },
    expiring_soon: { className: 'bg-warning/10 text-warning border-warning/20', icon: ShieldAlert },
    expired: { className: 'bg-destructive/10 text-destructive border-destructive/20', icon: ShieldX },
  };

  const { className: badgeClass, icon: Icon } = config[status];

  return (
    <Badge variant="outline" className={cn(badgeClass, 'gap-1')}>
      <Icon className="h-3 w-3" />
      {getWarrantyStatusLabel(status)}
    </Badge>
  );
}
