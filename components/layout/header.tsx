'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Search,
  Bell,
  Plus,
  Sun,
  Moon,
  Menu,
  ChevronRight,
  Package,
  ArrowDownToLine,
  ArrowUpFromLine,
  Truck,
  ClipboardList,
  User as UserIcon,
  LogOut,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAuthStore } from '@/store/auth-store';
import { useUIStore } from '@/store/ui-store';
import { useInventoryStore } from '@/store/inventory-store';
import { getRoleLabel } from '@/lib/permissions';
import { getInitials } from '@/lib/calculations';
import { cn } from '@/lib/utils';
import { usePathname } from 'next/navigation';

const quickAddItems = [
  { label: 'Add Product', href: '/products?action=add', icon: Package },
  { label: 'Stock In', href: '/inventory/stock-in', icon: ArrowDownToLine },
  { label: 'Stock Out', href: '/inventory/stock-out', icon: ArrowUpFromLine },
  { label: 'Add Supplier', href: '/suppliers?action=add', icon: Truck },
  { label: 'Create Purchase Order', href: '/purchase-center?tab=create', icon: ClipboardList },
];

function getPageTitle(pathname: string): string {
  const segments = pathname.split('/').filter(Boolean);
  if (segments.length === 0) return 'Dashboard';
  const map: Record<string, string> = {
    dashboard: 'Dashboard',
    products: 'Products',
    categories: 'Categories',
    suppliers: 'Suppliers',
    inventory: 'Inventory',
    'stock-in': 'Stock In',
    'stock-out': 'Stock Out',
    history: 'Stock History',
    'serial-imei': 'Serial / IMEI',
    warranty: 'Warranty',
    'purchase-center': 'Purchase Center',
    'purchase-orders': 'Purchase Orders',
    reorder: 'Reorder Suggestions',
    alerts: 'Alerts',
    'profit-loss': 'Profit & Loss',
    reports: 'Reports',
    users: 'User Management',
    settings: 'Settings',
  };
  return map[segments[segments.length - 1]] ?? segments[segments.length - 1];
}

export function Header() {
  const router = useRouter();
  const pathname = usePathname();
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const theme = useUIStore((s) => s.theme);
  const toggleTheme = useUIStore((s) => s.toggleTheme);
  const setMobileSidebar = useUIStore((s) => s.setMobileSidebar);
  const products = useInventoryStore((s) => s.products);
  const suppliers = useInventoryStore((s) => s.suppliers);
  const purchaseOrders = useInventoryStore((s) => s.purchaseOrders);
  const transactions = useInventoryStore((s) => s.transactions);
  const serials = useInventoryStore((s) => s.serials);
  const alerts = useInventoryStore((s) => s.alerts);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchOpen, setSearchOpen] = useState(false);

  const unreadAlerts = alerts.filter((a) => !a.read).length;

  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return null;
    const q = searchQuery.toLowerCase();
    return {
      products: products.filter((p) => p.name.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q)).slice(0, 3),
      suppliers: suppliers.filter((s) => s.name.toLowerCase().includes(q) || s.company.toLowerCase().includes(q)).slice(0, 3),
      pos: purchaseOrders.filter((p) => p.poNumber.toLowerCase().includes(q) || p.supplierName.toLowerCase().includes(q)).slice(0, 3),
      serials: serials.filter((s) => s.serialNumber.toLowerCase().includes(q) || (s.imei && s.imei.includes(q))).slice(0, 3),
      transactions: transactions.filter((t) => t.id.toLowerCase().includes(q) || t.productName.toLowerCase().includes(q)).slice(0, 3),
    };
  }, [searchQuery, products, suppliers, purchaseOrders, serials, transactions]);

  const hasResults = searchResults && Object.values(searchResults).some((arr) => arr.length > 0);

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-border bg-card px-4 lg:px-6">
      <Button
        variant="ghost"
        size="icon"
        className="lg:hidden"
        onClick={() => setMobileSidebar(true)}
      >
        <Menu className="h-5 w-5" />
      </Button>

      <div className="hidden md:block">
        <h1 className="text-lg font-bold text-foreground">{getPageTitle(pathname)}</h1>
        <div className="flex items-center text-xs text-muted-foreground">
          <span>ElectroStock</span>
          <ChevronRight className="mx-0.5 h-3 w-3" />
          <span className="font-medium text-foreground/70">{getPageTitle(pathname)}</span>
        </div>
      </div>

      <div className="relative ml-auto flex-1 max-w-md hidden sm:block">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search products, suppliers, POs, serials..."
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            setSearchOpen(true);
          }}
          onFocus={() => setSearchOpen(true)}
          onBlur={() => setTimeout(() => setSearchOpen(false), 200)}
          className="pl-9 bg-muted/50 border-transparent focus-visible:border-border"
        />
        {searchOpen && searchResults && hasResults && (
          <div className="absolute top-full mt-2 w-full rounded-lg border border-border bg-popover shadow-lg max-h-96 overflow-y-auto z-50 animate-in-fade">
            {searchResults.products.length > 0 && (
              <div className="p-2">
                <p className="px-2 py-1 text-xs font-semibold text-muted-foreground">Products</p>
                {searchResults.products.map((p) => (
                  <Link
                    key={p.id}
                    href={`/products/${p.id}`}
                    className="flex items-center gap-2 px-2 py-1.5 rounded hover:bg-muted text-sm"
                    onClick={() => { setSearchQuery(''); setSearchOpen(false); }}
                  >
                    <Package className="h-4 w-4 text-primary" />
                    <span className="truncate">{p.name}</span>
                    <span className="ml-auto font-mono-code text-xs text-muted-foreground">{p.sku}</span>
                  </Link>
                ))}
              </div>
            )}
            {searchResults.suppliers.length > 0 && (
              <div className="p-2 border-t">
                <p className="px-2 py-1 text-xs font-semibold text-muted-foreground">Suppliers</p>
                {searchResults.suppliers.map((s) => (
                  <Link
                    key={s.id}
                    href={`/suppliers/${s.id}`}
                    className="flex items-center gap-2 px-2 py-1.5 rounded hover:bg-muted text-sm"
                    onClick={() => { setSearchQuery(''); setSearchOpen(false); }}
                  >
                    <Truck className="h-4 w-4 text-primary" />
                    <span className="truncate">{s.name}</span>
                    <span className="ml-auto text-xs text-muted-foreground">{s.company}</span>
                  </Link>
                ))}
              </div>
            )}
            {searchResults.pos.length > 0 && (
              <div className="p-2 border-t">
                <p className="px-2 py-1 text-xs font-semibold text-muted-foreground">Purchase Orders</p>
                {searchResults.pos.map((p) => (
                  <Link
                    key={p.id}
                    href={`/purchase-orders/${p.id}`}
                    className="flex items-center gap-2 px-2 py-1.5 rounded hover:bg-muted text-sm"
                    onClick={() => { setSearchQuery(''); setSearchOpen(false); }}
                  >
                    <ClipboardList className="h-4 w-4 text-primary" />
                    <span className="font-mono-code text-xs">{p.poNumber}</span>
                    <span className="ml-auto text-xs text-muted-foreground truncate">{p.supplierName}</span>
                  </Link>
                ))}
              </div>
            )}
            {searchResults.serials.length > 0 && (
              <div className="p-2 border-t">
                <p className="px-2 py-1 text-xs font-semibold text-muted-foreground">Serial / IMEI</p>
                {searchResults.serials.map((s) => (
                  <Link
                    key={s.id}
                    href={`/serial-imei`}
                    className="flex items-center gap-2 px-2 py-1.5 rounded hover:bg-muted text-sm"
                    onClick={() => { setSearchQuery(''); setSearchOpen(false); }}
                  >
                    <span className="font-mono-code text-xs">{s.serialNumber}</span>
                    <span className="ml-auto text-xs text-muted-foreground truncate">{s.productName}</span>
                  </Link>
                ))}
              </div>
            )}
          </div>
        )}
        {searchOpen && searchResults && !hasResults && searchQuery.trim() && (
          <div className="absolute top-full mt-2 w-full rounded-lg border border-border bg-popover shadow-lg p-4 text-sm text-muted-foreground z-50">
            No results found for &quot;{searchQuery}&quot;
          </div>
        )}
      </div>

      <div className="ml-auto sm:ml-2 flex items-center gap-1.5">
        <Button variant="ghost" size="icon" onClick={toggleTheme} aria-label="Toggle theme">
          {theme === 'light' ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="relative" aria-label="Notifications">
              <Bell className="h-5 w-5" />
              {unreadAlerts > 0 && (
                <span className="absolute -top-0.5 -right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-bold text-white">
                  {unreadAlerts}
                </span>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80">
            <DropdownMenuLabel>Notifications</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {alerts.length === 0 ? (
              <div className="p-4 text-sm text-muted-foreground text-center">No notifications</div>
            ) : (
              alerts.slice(0, 5).map((alert) => (
                <DropdownMenuItem key={alert.id} className="flex flex-col items-start gap-1 py-2">
                  <div className="flex items-center gap-2 w-full">
                    <span className={cn(
                      'h-2 w-2 rounded-full shrink-0',
                      alert.severity === 'danger' ? 'bg-destructive' : alert.severity === 'warning' ? 'bg-warning' : 'bg-info'
                    )} />
                    <span className="text-sm font-medium truncate">{alert.title}</span>
                  </div>
                  <span className="text-xs text-muted-foreground line-clamp-2">{alert.message}</span>
                </DropdownMenuItem>
              ))
            )}
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/alerts" className="justify-center text-sm text-primary font-medium">
                View All Alerts
              </Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="default" size="sm" className="hidden sm:flex gap-1.5">
              <Plus className="h-4 w-4" /> Quick Add
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>Quick Actions</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {quickAddItems.map((item) => {
              const Icon = item.icon;
              return (
                <DropdownMenuItem key={item.label} asChild>
                  <Link href={item.href}>
                    <Icon className="mr-2 h-4 w-4" /> {item.label}
                  </Link>
                </DropdownMenuItem>
              );
            })}
          </DropdownMenuContent>
        </DropdownMenu>

        <Button variant="ghost" size="icon" className="sm:hidden" asChild>
          <Link href="/purchase-center?tab=create">
            <Plus className="h-5 w-5" />
          </Link>
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-2 rounded-lg pl-1.5 pr-2 py-1 hover:bg-muted transition-colors">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-sm font-bold text-white">
                {user ? getInitials(user.name) : 'U'}
              </div>
              <div className="hidden md:flex flex-col items-start">
                <span className="text-sm font-semibold leading-tight">{user?.name ?? 'User'}</span>
                <span className="text-xs text-muted-foreground">{user ? getRoleLabel(user.role) : ''}</span>
              </div>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>
              <div className="flex flex-col">
                <span>{user?.name}</span>
                <span className="text-xs font-normal text-muted-foreground">{user?.email}</span>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/settings"><UserIcon className="mr-2 h-4 w-4" /> Profile & Settings</Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={logout} className="text-destructive">
              <LogOut className="mr-2 h-4 w-4" /> Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
