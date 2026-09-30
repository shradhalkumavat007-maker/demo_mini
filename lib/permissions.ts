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
  | 'serial_imei'
  | 'warranty'
  | 'purchase_center'
  | 'purchase_orders'
  | 'reorder'
  | 'alerts'
  | 'profit_loss'
  | 'reports'
  | 'users'
  | 'settings';

const ROLE_PERMISSIONS: Record<UserRole, PermissionKey[]> = {
  admin: [
    'dashboard', 'products', 'categories', 'suppliers', 'inventory',
    'stock_in', 'stock_out', 'stock_history', 'serial_imei', 'warranty',
    'purchase_center', 'purchase_orders', 'reorder', 'alerts', 'profit_loss',
    'reports', 'users', 'settings',
  ],
  manager: [
    'dashboard', 'products', 'categories', 'suppliers', 'inventory',
    'stock_in', 'stock_out', 'stock_history', 'serial_imei', 'warranty',
    'purchase_center', 'purchase_orders', 'reorder', 'alerts', 'profit_loss',
    'reports',
  ],
  staff: [
    'dashboard', 'products', 'stock_in', 'stock_out', 'serial_imei',
    'warranty', 'alerts', 'reports',
  ],
};

export function hasPermission(role: UserRole, permission: PermissionKey): boolean {
  return ROLE_PERMISSIONS[role]?.includes(permission) ?? false;
}

export function getPermissions(role: UserRole): PermissionKey[] {
  return ROLE_PERMISSIONS[role] ?? [];
}

export function getRoleLabel(role: UserRole): string {
  return role.charAt(0).toUpperCase() + role.slice(1);
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
