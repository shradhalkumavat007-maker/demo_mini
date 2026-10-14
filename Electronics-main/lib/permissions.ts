import type { UserRole } from '@/types/user';

export type PermissionKey =
  | 'dashboard'
  | 'products'
  | 'categories'
  | 'suppliers'
  | 'inventory'
  | 'stock_in'
  | 'stock_out'
  | 'stock_history'
  | 'scan_product'
  | 'serial_imei'
  | 'warranty'
  | 'purchase_center'
  | 'purchase_orders'
  | 'reorder'
  | 'alerts'
  | 'profit_loss'
  | 'reports'
  | 'users'
  | 'settings'
  | 'audit_logs'
  | 'help'
  | 'profile';

const ROLE_PERMISSIONS: Record<UserRole, PermissionKey[]> = {
  admin: [
    'dashboard',
    'products',
    'categories',
    'suppliers',
    'inventory',
    'stock_in',
    'stock_out',
    'stock_history',
    'scan_product',
    'serial_imei',
    'warranty',
    'purchase_center',
    'purchase_orders',
    'reorder',
    'alerts',
    'profit_loss',
    'reports',
    'users',
    'settings',
    'audit_logs',
    'help',
    'profile',
  ],
  manager: [
    'dashboard',
    'products',
    'categories',
    'suppliers',
    'inventory',
    'stock_in',
    'stock_out',
    'stock_history',
    'scan_product',
    'serial_imei',
    'warranty',
    'purchase_center',
    'purchase_orders',
    'reorder',
    'alerts',
    'profit_loss',
    'reports',
    'help',
    'profile',
  ],
  staff: [
    'dashboard',
    'products',
    'stock_in',
    'stock_out',
    'stock_history',
    'scan_product',
    'serial_imei',
    'warranty',
    'alerts',
    'reports',
    'help',
    'profile',
  ],
};

export function hasPermission(role: UserRole, permission: PermissionKey): boolean {
  return ROLE_PERMISSIONS[role]?.includes(permission) ?? false;
}

export function getPermissions(role: UserRole): PermissionKey[] {
  return ROLE_PERMISSIONS[role] ?? [];
}

export function getRoleLabel(role: UserRole): string {
  switch (role) {
    case 'admin':
      return 'Administrator';
    case 'manager':
      return 'Manager';
    case 'staff':
      return 'Staff / Cashier';
    default:
      return (role as string).charAt(0).toUpperCase() + (role as string).slice(1);
  }
}

export function canViewFinancials(role: UserRole): boolean {
  return role === 'admin' || role === 'manager';
}

export function canManageUsers(role: UserRole): boolean {
  return role === 'admin';
}

export function canManageSettings(role: UserRole): boolean {
  return role === 'admin';
}

export function canViewAuditLogs(role: UserRole): boolean {
  return role === 'admin';
}

export function canManagePurchases(role: UserRole): boolean {
  return role === 'admin' || role === 'manager';
}

