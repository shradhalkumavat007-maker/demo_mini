import { useInventoryStore } from '@/store/inventory-store';
import type { AuditLog, AuditAction } from '@/types/audit';

export const auditService = {
  getLogs: (): AuditLog[] => {
    return useInventoryStore.getState().auditLogs;
  },

  logAction: (log: {
    action: AuditAction;
    actionLabel: string;
    userName?: string;
    userId?: string;
    userRole?: any;
    relatedId?: string;
    description: string;
    ipAddress?: string;
  }) => {
    useInventoryStore.getState().addAuditLog(log);
  },

  filterLogs: (params: {
    action?: string;
    userName?: string;
    searchQuery?: string;
    startDate?: string;
    endDate?: string;
  }): AuditLog[] => {
    const logs = useInventoryStore.getState().auditLogs;
    return logs.filter((log) => {
      if (params.action && params.action !== 'all' && log.action !== params.action) {
        return false;
      }
      if (params.userName && params.userName !== 'all' && log.userName !== params.userName) {
        return false;
      }
      if (params.startDate && log.date < params.startDate) {
        return false;
      }
      if (params.endDate && log.date > params.endDate) {
        return false;
      }
      if (params.searchQuery) {
        const q = params.searchQuery.toLowerCase();
        const matchesDesc = log.description.toLowerCase().includes(q);
        const matchesRelated = log.relatedId?.toLowerCase().includes(q);
        const matchesAction = log.actionLabel.toLowerCase().includes(q);
        const matchesUser = log.userName.toLowerCase().includes(q);
        if (!matchesDesc && !matchesRelated && !matchesAction && !matchesUser) {
          return false;
        }
      }
      return true;
    });
  },
};
