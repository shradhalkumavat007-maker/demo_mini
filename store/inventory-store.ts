import { create } from 'zustand';
import type { Product, ProductInput, Category } from '@/types/product';
import type { Supplier, SupplierInput } from '@/types/supplier';
import type { Transaction, StockInInput, StockOutInput } from '@/types/transaction';
import type { PurchaseOrder, PurchaseOrderInput, PurchaseOrderStatus, PurchaseOrderItem } from '@/types/purchase';
import type { SerialImei, SerialStatus } from '@/types/serial';
import type { Warranty } from '@/types/warranty';
import type { Alert, AlertType } from '@/types/alert';
import type { User, UserInput, UserRole } from '@/types/user';
import { mockProducts } from '@/data/mock-products';
import { mockCategories } from '@/data/mock-categories';
import { mockSuppliers } from '@/data/mock-suppliers';
import { mockTransactions } from '@/data/mock-transactions';
import { mockPurchaseOrders } from '@/data/mock-purchase-orders';
import { mockSerials } from '@/data/mock-serials';
import { mockWarranties } from '@/data/mock-warranties';
import { mockUsers } from '@/data/mock-users';
import {
  generateId,
  generateTransactionId,
  generatePONumber,
  generateSerialNumber,
  generateIMEI,
  getStockStatus,
  getWarrantyStatus,
  getAlertSeverity,
} from '@/lib/calculations';

interface InventoryState {
  products: Product[];
  categories: Category[];
  suppliers: Supplier[];
  transactions: Transaction[];
  purchaseOrders: PurchaseOrder[];
  serials: SerialImei[];
  warranties: Warranty[];
  alerts: Alert[];
  users: User[];

  // Products
  addProduct: (input: ProductInput) => Product;
  updateProduct: (id: string, input: ProductInput) => void;
  deleteProduct: (id: string) => void;
  getProduct: (id: string) => Product | undefined;
  getProductByName: (name: string) => Product | undefined;

  // Categories
  addCategory: (name: string, description: string) => void;

  // Suppliers
  addSupplier: (input: SupplierInput) => Supplier;
  updateSupplier: (id: string, input: SupplierInput) => void;
  deleteSupplier: (id: string) => void;
  getSupplier: (id: string) => Supplier | undefined;

  // Inventory
  stockIn: (input: StockInInput, userName: string, userId: string) => { success: boolean; error?: string; transaction?: Transaction };
  stockOut: (input: StockOutInput, userName: string, userId: string) => { success: boolean; error?: string; transaction?: Transaction };

  // Serials
  addSerial: (productId: string, serialNumber: string, imei: string | null) => { success: boolean; error?: string };
  updateSerialStatus: (id: string, status: SerialStatus) => void;

  // Purchase Orders
  createPurchaseOrder: (input: PurchaseOrderInput, userName: string, userId: string) => PurchaseOrder;
  updatePOStatus: (id: string, status: PurchaseOrderStatus) => { success: boolean; error?: string };
  receivePurchaseOrder: (id: string, userName: string, userId: string) => { success: boolean; error?: string };

  // Alerts
  markAlertRead: (id: string) => void;
  resolveAlert: (id: string) => void;
  generateAlerts: () => void;

  // Users
  addUser: (input: UserInput) => void;
  updateUser: (id: string, input: UserInput) => void;
  deleteUser: (id: string) => void;
  updateUserRole: (id: string, role: UserRole) => void;
  toggleUserStatus: (id: string) => void;
}

function recalcCategories(products: Product[], categories: Category[]): Category[] {
  return categories.map((c) => ({
    ...c,
    productCount: products.filter((p) => p.categoryId === c.id).length,
  }));
}

export const useInventoryStore = create<InventoryState>((set, get) => ({
  products: mockProducts,
  categories: recalcCategories(mockProducts, mockCategories),
  suppliers: mockSuppliers,
  transactions: mockTransactions,
  purchaseOrders: mockPurchaseOrders,
  serials: mockSerials,
  warranties: mockWarranties,
  alerts: [],
  users: mockUsers,

  addProduct: (input) => {
    const now = new Date().toISOString();
    const product: Product = {
      id: generateId('prod-'),
      ...input,
      stock: 0,
      createdAt: now,
      updatedAt: now,
    };
    set((state) => ({
      products: [...state.products, product],
      categories: recalcCategories([...state.products, product], state.categories),
    }));
    return product;
  },

  updateProduct: (id, input) => {
    set((state) => ({
      products: state.products.map((p) =>
        p.id === id ? { ...p, ...input, updatedAt: new Date().toISOString() } : p
      ),
    }));
  },

  deleteProduct: (id) => {
    set((state) => ({
      products: state.products.filter((p) => p.id !== id),
      serials: state.serials.filter((s) => s.productId !== id),
      categories: recalcCategories(state.products.filter((p) => p.id !== id), state.categories),
    }));
  },

  getProduct: (id) => get().products.find((p) => p.id === id),
  getProductByName: (name) => get().products.find((p) => p.name === name),

  addCategory: (name, description) => {
    const category: Category = {
      id: generateId('cat-'),
      name,
      description,
      productCount: 0,
    };
    set((state) => ({ categories: [...state.categories, category] }));
  },

  addSupplier: (input) => {
    const supplier: Supplier = {
      id: generateId('sup-'),
      ...input,
      createdAt: new Date().toISOString(),
    };
    set((state) => ({ suppliers: [...state.suppliers, supplier] }));
    return supplier;
  },

  updateSupplier: (id, input) => {
    set((state) => ({
      suppliers: state.suppliers.map((s) => (s.id === id ? { ...s, ...input } : s)),
    }));
  },

  deleteSupplier: (id) => {
    set((state) => ({
      suppliers: state.suppliers.filter((s) => s.id !== id),
    }));
  },

  getSupplier: (id) => get().suppliers.find((s) => s.id === id),

  stockIn: (input, userName, userId) => {
    const product = get().products.find((p) => p.id === input.productId);
    if (!product) return { success: false, error: 'Product not found' };

    const transaction: Transaction = {
      id: generateTransactionId('stock_in'),
      productId: input.productId,
      productName: product.name,
      type: 'stock_in',
      quantity: input.quantity,
      unitPrice: input.purchasePrice,
      totalValue: input.quantity * input.purchasePrice,
      purchaseCost: input.quantity * input.purchasePrice,
      profitLoss: 0,
      date: input.date ? new Date(input.date).toISOString() : new Date().toISOString(),
      userId,
      userName,
      reference: input.reference,
      customerRef: '',
      notes: input.notes,
      serialNumbers: input.serialNumbers,
    };

    const newSerials: SerialImei[] = input.serialNumbers.map((sn) => ({
      id: generateId('ser-'),
      productId: product.id,
      productName: product.name,
      serialNumber: sn,
      imei: null,
      status: 'available' as SerialStatus,
      warrantyId: null,
      dateAdded: new Date().toISOString(),
      dateSold: null,
      customerRef: null,
    }));

    set((state) => ({
      products: state.products.map((p) =>
        p.id === input.productId
          ? {
              ...p,
              stock: p.stock + input.quantity,
              purchasePrice: input.purchasePrice,
              updatedAt: new Date().toISOString(),
            }
          : p
      ),
      transactions: [transaction, ...state.transactions],
      serials: [...newSerials, ...state.serials],
    }));

    get().generateAlerts();
    return { success: true, transaction };
  },

  stockOut: (input, userName, userId) => {
    const product = get().products.find((p) => p.id === input.productId);
    if (!product) return { success: false, error: 'Product not found' };
    if (product.stock < input.quantity) {
      return { success: false, error: `Insufficient stock. Available: ${product.stock}, Requested: ${input.quantity}` };
    }

    const salesValue = input.quantity * input.sellingPrice;
    const purchaseCost = input.quantity * product.purchasePrice;
    const profitLoss = salesValue - purchaseCost;

    const transaction: Transaction = {
      id: generateTransactionId('stock_out'),
      productId: input.productId,
      productName: product.name,
      type: 'stock_out',
      quantity: input.quantity,
      unitPrice: input.sellingPrice,
      totalValue: salesValue,
      purchaseCost,
      profitLoss,
      date: input.date ? new Date(input.date).toISOString() : new Date().toISOString(),
      userId,
      userName,
      reference: '',
      customerRef: input.customerRef,
      notes: input.notes,
      serialNumbers: input.serialNumbers,
    };

    const now = new Date().toISOString();

    set((state) => ({
      products: state.products.map((p) =>
        p.id === input.productId
          ? { ...p, stock: p.stock - input.quantity, updatedAt: now }
          : p
      ),
      transactions: [transaction, ...state.transactions],
      serials: state.serials.map((s) => {
        if (input.serialNumbers.includes(s.serialNumber)) {
          return { ...s, status: 'sold' as SerialStatus, dateSold: now, customerRef: input.customerRef };
        }
        return s;
      }),
      warranties: [
        ...state.warranties,
        ...input.serialNumbers.map((sn) => {
          const endDate = new Date();
          endDate.setMonth(endDate.getMonth() + product.warrantyPeriodMonths);
          return {
            id: generateId('war-'),
            productId: product.id,
            productName: product.name,
            serialNumber: sn,
            customerRef: input.customerRef,
            startDate: now,
            endDate: endDate.toISOString(),
            status: getWarrantyStatus(now, endDate.toISOString()),
          } as Warranty;
        }),
      ],
    }));

    get().generateAlerts();
    return { success: true, transaction };
  },

  addSerial: (productId, serialNumber, imei) => {
    const existing = get().serials.find((s) => s.serialNumber === serialNumber);
    if (existing) return { success: false, error: 'Serial number already exists' };
    const product = get().products.find((p) => p.id === productId);
    if (!product) return { success: false, error: 'Product not found' };

    const serial: SerialImei = {
      id: generateId('ser-'),
      productId,
      productName: product.name,
      serialNumber,
      imei,
      status: 'available',
      warrantyId: null,
      dateAdded: new Date().toISOString(),
      dateSold: null,
      customerRef: null,
    };
    set((state) => ({ serials: [serial, ...state.serials] }));
    return { success: true };
  },

  updateSerialStatus: (id, status) => {
    set((state) => ({
      serials: state.serials.map((s) => {
        if (s.id === id) {
          return {
            ...s,
            status,
            dateSold: status === 'sold' ? new Date().toISOString() : s.dateSold,
          };
        }
        return s;
      }),
    }));
  },

  createPurchaseOrder: (input, userName, userId) => {
    const supplier = get().suppliers.find((s) => s.id === input.supplierId);
    const products = get().products;
    const items: PurchaseOrderItem[] = input.items.map((item) => {
      const product = products.find((p) => p.id === item.productId);
      return {
        productId: item.productId,
        productName: product?.name ?? 'Unknown Product',
        quantity: item.quantity,
        receivedQuantity: 0,
        unitPrice: item.unitPrice,
        total: item.quantity * item.unitPrice,
      };
    });

    const totalCost = items.reduce((sum, i) => sum + i.total, 0);

    const po: PurchaseOrder = {
      id: generateId('po-'),
      poNumber: generatePONumber(),
      supplierId: input.supplierId,
      supplierName: supplier?.name ?? 'Unknown Supplier',
      items,
      totalCost,
      status: 'draft',
      createdDate: new Date().toISOString(),
      expectedDate: input.expectedDate ? new Date(input.expectedDate).toISOString() : new Date().toISOString(),
      receivedDate: null,
      userId,
      userName,
      notes: input.notes,
    };

    set((state) => ({ purchaseOrders: [po, ...state.purchaseOrders] }));
    return po;
  },

  updatePOStatus: (id, status) => {
    const po = get().purchaseOrders.find((p) => p.id === id);
    if (!po) return { success: false, error: 'Purchase order not found' };

    const validTransitions: Record<PurchaseOrderStatus, PurchaseOrderStatus[]> = {
      draft: ['pending', 'cancelled'],
      pending: ['approved', 'cancelled'],
      approved: ['ordered', 'cancelled'],
      ordered: ['partially_received', 'received', 'cancelled'],
      partially_received: ['received'],
      received: [],
      cancelled: [],
    };

    if (!validTransitions[po.status].includes(status)) {
      return { success: false, error: `Cannot change status from ${po.status} to ${status}` };
    }

    set((state) => ({
      purchaseOrders: state.purchaseOrders.map((p) =>
        p.id === id ? { ...p, status } : p
      ),
    }));
    return { success: true };
  },

  receivePurchaseOrder: (id, userName, userId) => {
    const po = get().purchaseOrders.find((p) => p.id === id);
    if (!po) return { success: false, error: 'Purchase order not found' };
    if (po.status !== 'ordered' && po.status !== 'partially_received') {
      return { success: false, error: `Purchase order cannot be received in ${po.status} state. It must be ordered first.` };
    }

    const products = get().products;
    const newTransactions: Transaction[] = [];
    const now = new Date().toISOString();

    po.items.forEach((item) => {
      const product = products.find((p) => p.id === item.productId);
      if (product) {
        const txn: Transaction = {
          id: generateTransactionId('stock_in'),
          productId: item.productId,
          productName: product.name,
          type: 'stock_in',
          quantity: item.quantity - item.receivedQuantity,
          unitPrice: item.unitPrice,
          totalValue: (item.quantity - item.receivedQuantity) * item.unitPrice,
          purchaseCost: (item.quantity - item.receivedQuantity) * item.unitPrice,
          profitLoss: 0,
          date: now,
          userId,
          userName,
          reference: po.poNumber,
          customerRef: '',
          notes: `Received from PO ${po.poNumber}`,
          serialNumbers: [],
        };
        newTransactions.push(txn);
      }
    });

    set((state) => ({
      products: state.products.map((p) => {
        const poItem = po.items.find((i) => i.productId === p.id);
        if (poItem) {
          return {
            ...p,
            stock: p.stock + (poItem.quantity - poItem.receivedQuantity),
            purchasePrice: poItem.unitPrice,
            updatedAt: now,
          };
        }
        return p;
      }),
      transactions: [...newTransactions, ...state.transactions],
      purchaseOrders: state.purchaseOrders.map((p) =>
        p.id === id
          ? {
              ...p,
              status: 'received',
              receivedDate: now,
              items: p.items.map((i) => ({ ...i, receivedQuantity: i.quantity })),
            }
          : p
      ),
    }));

    get().generateAlerts();
    return { success: true };
  },

  markAlertRead: (id) => {
    set((state) => ({
      alerts: state.alerts.map((a) => (a.id === id ? { ...a, read: true } : a)),
    }));
  },

  resolveAlert: (id) => {
    set((state) => ({
      alerts: state.alerts.map((a) => (a.id === id ? { ...a, resolved: true, read: true } : a)),
    }));
  },

  generateAlerts: () => {
    const { products, warranties, purchaseOrders } = get();
    const newAlerts: Alert[] = [];

    products.forEach((p) => {
      const status = getStockStatus(p.stock, p.minStock);
      if (status === 'out_of_stock') {
        newAlerts.push({
          id: generateId('alert-'),
          type: 'out_of_stock' as AlertType,
          severity: getAlertSeverity('out_of_stock'),
          title: `${p.name} is out of stock`,
          message: `${p.name} (SKU: ${p.sku}) is completely out of stock. Please reorder immediately.`,
          productId: p.id,
          productName: p.name,
          read: false,
          resolved: false,
          createdAt: new Date().toISOString(),
        });
      } else if (status === 'low_stock') {
        newAlerts.push({
          id: generateId('alert-'),
          type: 'low_stock' as AlertType,
          severity: getAlertSeverity('low_stock'),
          title: `${p.name} is below minimum stock`,
          message: `${p.name} stock is ${p.stock}, below the minimum level of ${p.minStock}. Consider reordering.`,
          productId: p.id,
          productName: p.name,
          read: false,
          resolved: false,
          createdAt: new Date().toISOString(),
        });
      }
    });

    warranties.forEach((w) => {
      const status = getWarrantyStatus(w.startDate, w.endDate);
      if (status === 'expired') {
        newAlerts.push({
          id: generateId('alert-'),
          type: 'warranty_expired' as AlertType,
          severity: getAlertSeverity('warranty_expired'),
          title: `Warranty expired for ${w.productName}`,
          message: `Warranty for ${w.productName} (Serial: ${w.serialNumber}) expired. Customer: ${w.customerRef}`,
          productId: w.productId,
          productName: w.productName,
          read: false,
          resolved: false,
          createdAt: new Date().toISOString(),
        });
      } else if (status === 'expiring_soon') {
        newAlerts.push({
          id: generateId('alert-'),
          type: 'warranty_expiring' as AlertType,
          severity: getAlertSeverity('warranty_expiring'),
          title: `Warranty expiring soon for ${w.productName}`,
          message: `Warranty for ${w.productName} (Serial: ${w.serialNumber}) expires soon. Customer: ${w.customerRef}`,
          productId: w.productId,
          productName: w.productName,
          read: false,
          resolved: false,
          createdAt: new Date().toISOString(),
        });
      }
    });

    purchaseOrders
      .filter((po) => po.status === 'pending')
      .forEach((po) => {
        newAlerts.push({
          id: generateId('alert-'),
          type: 'pending_po' as AlertType,
          severity: getAlertSeverity('pending_po'),
          title: `Purchase order ${po.poNumber} pending approval`,
          message: `PO ${po.poNumber} from ${po.supplierName} for ${po.items.length} item(s) totaling ${po.totalCost} is awaiting approval.`,
          productId: null,
          productName: null,
          read: false,
          resolved: false,
          createdAt: new Date().toISOString(),
        });
      });

    set({ alerts: newAlerts });
  },

  addUser: (input) => {
    const user: User = {
      id: generateId('user-'),
      ...input,
      lastLogin: null,
      createdAt: new Date().toISOString(),
    };
    set((state) => ({ users: [...state.users, user] }));
  },

  updateUser: (id, input) => {
    set((state) => ({
      users: state.users.map((u) => (u.id === id ? { ...u, ...input } : u)),
    }));
  },

  deleteUser: (id) => {
    set((state) => ({ users: state.users.filter((u) => u.id !== id) }));
  },

  updateUserRole: (id, role) => {
    set((state) => ({
      users: state.users.map((u) => (u.id === id ? { ...u, role } : u)),
    }));
  },

  toggleUserStatus: (id) => {
    set((state) => ({
      users: state.users.map((u) =>
        u.id === id ? { ...u, status: u.status === 'active' ? 'inactive' : 'active' } : u
      ),
    }));
  },
}));
