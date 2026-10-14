import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { apiClient } from '@/services/api-client';
import type { Product, ProductInput, Category } from '@/types/product';
import type { Supplier, SupplierInput } from '@/types/supplier';
import type { Transaction, StockInInput, StockOutInput } from '@/types/transaction';
import type { PurchaseOrder, PurchaseOrderInput, PurchaseOrderStatus, PurchaseOrderItem } from '@/types/purchase';
import type { SerialImei, SerialStatus } from '@/types/serial';
import type { Warranty, WarrantyInput, WarrantyClaim } from '@/types/warranty';
import type { Alert, AlertType } from '@/types/alert';
import type { User, UserInput, UserRole } from '@/types/user';
import type { SystemSettings } from '@/types/settings';
import type { SaleReceipt, CheckoutSaleInput, BusinessInfo } from '@/types/sale';
import type { AuditLog, AuditAction } from '@/types/audit';
import { defaultSettings } from '@/types/settings';
import { mockProducts } from '@/data/mock-products';
import { mockCategories } from '@/data/mock-categories';
import { mockSuppliers } from '@/data/mock-suppliers';
import { mockTransactions } from '@/data/mock-transactions';
import { mockPurchaseOrders } from '@/data/mock-purchase-orders';
import { mockSerials } from '@/data/mock-serials';
import { mockWarranties } from '@/data/mock-warranties';
import { mockUsers } from '@/data/mock-users';
import { mockAuditLogs } from '@/data/mock-audit';
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
  receipts: SaleReceipt[];
  isHydrated: boolean;
  hydrateFromDatabase: () => Promise<void>;

  // Products
  addProduct: (input: ProductInput) => Product;
  updateProduct: (id: string, input: ProductInput) => void;
  deleteProduct: (id: string) => void;
  getProduct: (id: string) => Product | undefined;
  getProductByName: (name: string) => Product | undefined;

  // Categories
  addCategory: (name: string, description: string) => void;
  updateCategory: (id: string, name: string, description: string) => void;
  deleteCategory: (id: string) => void;

  // Suppliers
  addSupplier: (input: SupplierInput) => Supplier;
  updateSupplier: (id: string, input: SupplierInput) => void;
  deleteSupplier: (id: string) => void;
  getSupplier: (id: string) => Supplier | undefined;

  // Inventory
  stockIn: (input: StockInInput, userName: string, userId: string) => { success: boolean; error?: string; transaction?: Transaction };
  stockOut: (input: StockOutInput, userName: string, userId: string) => { success: boolean; error?: string; transaction?: Transaction };
  checkoutSale: (
    input: CheckoutSaleInput,
    userName?: string,
    userId?: string
  ) => {
    success: boolean;
    error?: string;
    receipt?: SaleReceipt;
    transactions?: Transaction[];
  };
  getReceipt: (receiptNumber: string) => SaleReceipt | undefined;

  // Serials
  addSerial: (productId: string, serialNumber: string, imei: string | null) => { success: boolean; error?: string };
  updateSerialStatus: (id: string, status: SerialStatus) => void;

  // Warranties
  addWarranty: (input: WarrantyInput) => Warranty;
  claimWarranty: (warrantyId: string, issueDescription: string, status?: WarrantyClaim['status'], notes?: string) => { success: boolean; error?: string };

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

  // Settings
  settings: SystemSettings;
  updateSettings: (settings: Partial<SystemSettings>) => void;
  resetDemoData: () => void;

  // Audit Logs
  auditLogs: AuditLog[];
  addAuditLog: (log: {
    action: AuditAction;
    actionLabel: string;
    userName?: string;
    userId?: string;
    userRole?: UserRole;
    relatedId?: string;
    description: string;
    ipAddress?: string;
  }) => void;
}

function recalcCategories(products: Product[], categories: Category[]): Category[] {
  return categories.map((c) => ({
    ...c,
    productCount: products.filter((p) => p.categoryId === c.id).length,
  }));
}

function loadInitialReceipts(): SaleReceipt[] {
  if (typeof window !== 'undefined') {
    try {
      const stored = localStorage.getItem('electrostock_sales_receipts');
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.warn('Failed to parse cached sales receipts:', e);
    }
  }
  return [];
}

export const useInventoryStore = create<InventoryState>()(
  persist(
    (set, get) => ({
      products: mockProducts,
      categories: recalcCategories(mockProducts, mockCategories),
      suppliers: mockSuppliers,
      transactions: mockTransactions,
      purchaseOrders: mockPurchaseOrders,
      serials: mockSerials,
      warranties: mockWarranties,
      alerts: [],
      users: mockUsers,
      settings: defaultSettings,
      receipts: loadInitialReceipts(),
      auditLogs: mockAuditLogs,
      isHydrated: false,

      hydrateFromDatabase: async () => {
        try {
          const [prodsRes, catsRes, supsRes, txnsRes, sersRes, warsRes, recsRes] = await Promise.allSettled([
            apiClient.getProducts(),
            apiClient.getCategories(),
            apiClient.getSuppliers(),
            apiClient.getTransactions(),
            apiClient.getSerials(),
            apiClient.getWarranties(),
            apiClient.getReceipts(),
          ]);

          set((state) => {
            const fetchedProds = prodsRes.status === 'fulfilled' && Array.isArray(prodsRes.value) && prodsRes.value.length > 0
              ? prodsRes.value
              : state.products;

            const fetchedCats = catsRes.status === 'fulfilled' && Array.isArray(catsRes.value) && catsRes.value.length > 0
              ? catsRes.value
              : state.categories;

            const fetchedSups = supsRes.status === 'fulfilled' && Array.isArray(supsRes.value) && supsRes.value.length > 0
              ? supsRes.value
              : state.suppliers;

            const fetchedTxns = txnsRes.status === 'fulfilled' && Array.isArray(txnsRes.value)
              ? txnsRes.value
              : state.transactions;

            const fetchedSers = sersRes.status === 'fulfilled' && Array.isArray(sersRes.value)
              ? sersRes.value
              : state.serials;

            const fetchedWars = warsRes.status === 'fulfilled' && Array.isArray(warsRes.value)
              ? warsRes.value
              : state.warranties;

            const fetchedRecs = recsRes.status === 'fulfilled' && Array.isArray(recsRes.value)
              ? recsRes.value
              : state.receipts;

            return {
              products: fetchedProds,
              categories: recalcCategories(fetchedProds, fetchedCats),
              suppliers: fetchedSups,
              transactions: fetchedTxns,
              serials: fetchedSers,
              warranties: fetchedWars,
              receipts: fetchedRecs,
              isHydrated: true,
            };
          });

          get().generateAlerts();
        } catch (e) {
          console.warn('[Hydration] Error hydrating inventory store from database:', e);
        }
      },

      addAuditLog: (log) => {
        const now = new Date();
        const dateStr = now.toISOString().split('T')[0];
        const timeStr = now.toTimeString().split(' ')[0];
        const newLog: AuditLog = {
          id: generateId('aud-'),
          action: log.action,
          actionLabel: log.actionLabel,
          userName: log.userName || 'System Administrator',
          userId: log.userId || 'user-1',
          userRole: log.userRole || 'admin',
          date: dateStr,
          time: timeStr,
          timestamp: now.toISOString(),
          relatedId: log.relatedId,
          description: log.description,
          ipAddress: log.ipAddress || '192.168.1.1',
        };
        set((state) => ({ auditLogs: [newLog, ...state.auditLogs] }));
      },

      addProduct: (input) => {
        const now = new Date().toISOString();
        const prodId = (input as any).id || generateId('prod-');
        const product: Product = {
          id: prodId,
          ...input,
          stock: input.stock ?? 0,
          minStock: input.minStock ?? 5,
          createdAt: (input as any).createdAt || now,
          updatedAt: now,
        };
        set((state) => {
          const existingIdx = state.products.findIndex((p) => p.id === prodId || (p.sku && p.sku === product.sku));
          let nextProds: Product[];
          if (existingIdx >= 0) {
            nextProds = [...state.products];
            nextProds[existingIdx] = { ...nextProds[existingIdx], ...product };
          } else {
            nextProds = [product, ...state.products];
          }
          return {
            products: nextProds,
            categories: recalcCategories(nextProds, state.categories),
          };
        });
        get().addAuditLog({
          action: 'product_created',
          actionLabel: 'Product Added',
          relatedId: product.sku,
          description: `Added product ${product.name} (${product.brand}) - SKU: ${product.sku}`,
        });
        return product;
      },

  updateProduct: (id, input) => {
    set((state) => ({
      products: state.products.map((p) =>
        p.id === id ? { ...p, ...input, updatedAt: new Date().toISOString() } : p
      ),
    }));
    get().addAuditLog({
      action: 'product_updated',
      actionLabel: 'Product Updated',
      relatedId: input.sku || id,
      description: `Updated product specs / price for ${input.name || id}`,
    });
  },

  deleteProduct: (id) => {
    const prod = get().products.find((p) => p.id === id);
    set((state) => ({
      products: state.products.filter((p) => p.id !== id),
      serials: state.serials.filter((s) => s.productId !== id),
      categories: recalcCategories(state.products.filter((p) => p.id !== id), state.categories),
    }));
    get().addAuditLog({
      action: 'product_deleted',
      actionLabel: 'Product Deleted',
      relatedId: prod?.sku || id,
      description: `Deleted product ${prod?.name || id} from catalog`,
    });
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

  updateCategory: (id, name, description) => {
    set((state) => ({
      categories: state.categories.map((c) =>
        c.id === id ? { ...c, name, description } : c
      ),
    }));
  },

  deleteCategory: (id) => {
    set((state) => ({
      categories: state.categories.filter((c) => c.id !== id),
    }));
  },

  addSupplier: (input) => {
    const supplier: Supplier = {
      id: generateId('sup-'),
      ...input,
      createdAt: new Date().toISOString(),
    };
    set((state) => ({ suppliers: [...state.suppliers, supplier] }));
    get().addAuditLog({
      action: 'supplier_created',
      actionLabel: 'Supplier Added',
      relatedId: supplier.id,
      description: `Registered new vendor ${supplier.company} (${supplier.name})`,
    });
    return supplier;
  },

  updateSupplier: (id, input) => {
    set((state) => ({
      suppliers: state.suppliers.map((s) => (s.id === id ? { ...s, ...input } : s)),
    }));
    get().addAuditLog({
      action: 'supplier_updated',
      actionLabel: 'Supplier Updated',
      relatedId: id,
      description: `Updated supplier details for ${input.company || id}`,
    });
  },

  deleteSupplier: (id) => {
    const sup = get().suppliers.find((s) => s.id === id);
    set((state) => ({
      suppliers: state.suppliers.filter((s) => s.id !== id),
    }));
    get().addAuditLog({
      action: 'supplier_deleted',
      actionLabel: 'Supplier Deleted',
      relatedId: id,
      description: `Deleted supplier ${sup?.company || id}`,
    });
  },

  getSupplier: (id) => get().suppliers.find((s) => s.id === id),

  stockIn: (input, userName, userId) => {
    if (!input || !input.productId) {
      return { success: false, error: 'Product selection is required' };
    }
    const product = get().products.find((p) => p.id === input.productId);
    if (!product) return { success: false, error: 'Product not found in inventory' };

    const qty = Math.max(1, Number(input.quantity) || 1);
    const unitCost = Math.max(0, Number(input.purchasePrice) || 0);

    let txDate = new Date().toISOString();
    if (input.date) {
      const parsed = new Date(input.date);
      if (!isNaN(parsed.getTime())) {
        txDate = parsed.toISOString();
      }
    }

    const transaction: Transaction = {
      id: generateTransactionId('stock_in'),
      productId: input.productId,
      productName: product.name,
      type: 'stock_in',
      quantity: qty,
      unitPrice: unitCost,
      totalValue: qty * unitCost,
      purchaseCost: qty * unitCost,
      profitLoss: 0,
      date: txDate,
      userId: userId || 'usr-admin',
      userName: userName || 'Administrator',
      reference: input.reference || '',
      customerRef: '',
      notes: input.notes || '',
      serialNumbers: Array.isArray(input.serialNumbers) ? input.serialNumbers : [],
    };

    const serialsList = Array.isArray(input.serialNumbers) ? input.serialNumbers : [];

    const newSerials: SerialImei[] = serialsList.map((sn) => ({
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
              stock: p.stock + qty,
              purchasePrice: unitCost,
              updatedAt: new Date().toISOString(),
            }
          : p
      ),
      transactions: [transaction, ...state.transactions],
      serials: [...newSerials, ...state.serials],
    }));

    try {
      get().generateAlerts();
    } catch (e) {
      console.warn('Failed to update alerts:', e);
    }

    get().addAuditLog({
      action: 'stock_in',
      actionLabel: 'Stock Inwarded',
      userName,
      userId,
      relatedId: transaction.id,
      description: `Inwarded ${qty} units of ${product.name} (Unit cost: ₹${unitCost})`,
    });

    return { success: true, transaction };
  },

  stockOut: (input, userName, userId) => {
    if (!input || !input.productId) {
      return { success: false, error: 'Product selection is required' };
    }
    const product = get().products.find((p) => p.id === input.productId);
    if (!product) return { success: false, error: 'Product not found in inventory' };

    const qty = Math.max(1, Number(input.quantity) || 1);
    const unitPrice = Math.max(0, Number(input.sellingPrice) || 0);

    if (product.stock < qty) {
      return {
        success: false,
        error: `Insufficient stock. Available: ${product.stock} units, Requested: ${qty} units.`,
      };
    }

    const serialsList = Array.isArray(input.serialNumbers) ? input.serialNumbers : [];
    const salesValue = qty * unitPrice;
    const purchaseCost = qty * product.purchasePrice;
    const profitLoss = salesValue - purchaseCost;

    let txDate = new Date().toISOString();
    if (input.date) {
      const parsed = new Date(input.date);
      if (!isNaN(parsed.getTime())) {
        txDate = parsed.toISOString();
      }
    }

    const transaction: Transaction = {
      id: generateTransactionId('stock_out'),
      productId: input.productId,
      productName: product.name,
      type: 'stock_out',
      quantity: qty,
      unitPrice: unitPrice,
      totalValue: salesValue,
      purchaseCost,
      profitLoss,
      date: txDate,
      userId: userId || 'usr-admin',
      userName: userName || 'Administrator',
      reference: '',
      customerRef: input.customerRef || 'Direct Customer',
      notes: input.notes || '',
      serialNumbers: serialsList,
    };

    const now = new Date().toISOString();

    set((state) => ({
      products: state.products.map((p) =>
        p.id === input.productId
          ? { ...p, stock: Math.max(0, p.stock - qty), updatedAt: now }
          : p
      ),
      transactions: [transaction, ...state.transactions],
      serials: state.serials.map((s) => {
        if (serialsList.includes(s.serialNumber)) {
          return {
            ...s,
            status: 'sold' as SerialStatus,
            dateSold: now,
            customerRef: input.customerRef || 'Direct Customer',
          };
        }
        return s;
      }),
      warranties: [
        ...state.warranties,
        ...serialsList.map((sn) => {
          const endDate = new Date();
          const months =
            typeof product.warrantyPeriodMonths === 'number' && !isNaN(product.warrantyPeriodMonths)
              ? product.warrantyPeriodMonths
              : 12;
          endDate.setMonth(endDate.getMonth() + months);
          const safeEndDate = !isNaN(endDate.getTime()) ? endDate.toISOString() : new Date().toISOString();
          return {
            id: generateId('war-'),
            productId: product.id,
            productName: product.name,
            serialNumber: sn,
            customerRef: input.customerRef || 'Direct Customer',
            customerName: input.customerRef || 'Direct Customer',
            startDate: now,
            endDate: safeEndDate,
            status: getWarrantyStatus(now, safeEndDate),
          } as Warranty;
        }),
      ],
    }));

    try {
      get().generateAlerts();
    } catch (e) {
      console.warn('Failed to update alerts:', e);
    }

    get().addAuditLog({
      action: 'stock_out',
      actionLabel: 'Stock Outwarded',
      userName,
      userId,
      relatedId: transaction.id,
      description: `Outwarded ${qty} units of ${product.name} (Total: ₹${salesValue}) for ${input.customerRef || 'Direct Customer'}`,
    });

    return { success: true, transaction };
  },

  checkoutSale: (input, userName, userId) => {
    if (!input || !input.items || input.items.length === 0) {
      return { success: false, error: 'Checkout cart is empty.' };
    }
    const currentProducts = get().products;
    const currentSerials = get().serials;
    const currentSettings = get().settings;

    // Validate that all items exist and have adequate stock
    for (const item of input.items) {
      const prod = currentProducts.find((p) => p.id === item.productId || (item.sku && p.sku === item.sku));
      if (!prod) {
        return { success: false, error: `Product "${item.productName || item.sku}" was not found in inventory.` };
      }
      if (prod.stock < item.quantity) {
        return {
          success: false,
          error: `Insufficient stock for "${prod.name}". Available: ${prod.stock}, Requested: ${item.quantity}.`,
        };
      }
    }

    const now = new Date().toISOString();
    const dateStr = now.slice(0, 10).replace(/-/g, '');
    const randSuffix = Math.floor(1000 + Math.random() * 9000);
    const receiptNumber = `RCP-${dateStr}-${randSuffix}`;
    const parentTxnId = `TXN-OUT-${dateStr}-${randSuffix}`;

    const generatedTransactions: Transaction[] = [];
    const assignedSerials: string[] = [];
    const newWarranties: Warranty[] = [];

    let totalSellingCost = 0;
    let totalPurchaseCost = 0;

    // Update products and generate stock_out transactions
    const updatedProducts = currentProducts.map((p) => {
      const cartItem = input.items.find((it) => it.productId === p.id || (it.sku && it.sku === p.sku));
      if (!cartItem) return p;

      const itemSellingVal = (cartItem.unitPrice * cartItem.quantity) - (cartItem.discount || 0);
      const itemPurchaseCost = p.purchasePrice * cartItem.quantity;
      const itemProfitLoss = itemSellingVal - itemPurchaseCost;

      totalSellingCost += itemSellingVal;
      totalPurchaseCost += itemPurchaseCost;

      const itemTxn: Transaction = {
        id: generateTransactionId('stock_out'),
        productId: p.id,
        productName: p.name,
        type: 'stock_out',
        quantity: cartItem.quantity,
        unitPrice: cartItem.unitPrice,
        totalValue: itemSellingVal,
        purchaseCost: itemPurchaseCost,
        profitLoss: itemProfitLoss,
        date: now,
        userId: userId || 'usr-admin',
        userName: userName || 'Administrator',
        reference: receiptNumber,
        customerRef: input.customer.name,
        notes: `POS Checkout Sale | Receipt: ${receiptNumber} | Method: ${input.paymentMethod.toUpperCase()}${input.paymentReference ? ' | Ref: ' + input.paymentReference : ''}${input.notes ? ' | ' + input.notes : ''}`,
        serialNumbers: cartItem.serialNumbers || [],
      };

      generatedTransactions.push(itemTxn);

      // Track serials & warranties
      if (cartItem.serialNumbers && cartItem.serialNumbers.length > 0) {
        cartItem.serialNumbers.forEach((sn) => {
          assignedSerials.push(sn);
          const endDate = new Date();
          const months = typeof cartItem.warrantyPeriodMonths === 'number'
            ? cartItem.warrantyPeriodMonths
            : (typeof p?.warrantyPeriodMonths === 'number' ? p.warrantyPeriodMonths : 0);
          endDate.setMonth(endDate.getMonth() + months);
          const safeEndDate = !isNaN(endDate.getTime()) ? endDate.toISOString() : now;

          newWarranties.push({
            id: generateId('war-'),
            productId: p.id,
            productName: p.name,
            serialNumber: sn,
            customerRef: input.customer.name,
            customerName: input.customer.name,
            startDate: now,
            endDate: safeEndDate,
            status: months === 0 ? 'expired' : getWarrantyStatus(now, safeEndDate),
          } as Warranty);
        });
      } else {
        const endDate = new Date();
        const months = typeof cartItem.warrantyPeriodMonths === 'number'
          ? cartItem.warrantyPeriodMonths
          : (typeof p?.warrantyPeriodMonths === 'number' ? p.warrantyPeriodMonths : 0);
        endDate.setMonth(endDate.getMonth() + months);
        const safeEndDate = !isNaN(endDate.getTime()) ? endDate.toISOString() : now;

        newWarranties.push({
          id: generateId('war-'),
          productId: p.id,
          productName: p.name,
          serialNumber: `${cartItem.sku}-${generateId('')}`,
          customerRef: input.customer.name,
          customerName: input.customer.name,
          startDate: now,
          endDate: safeEndDate,
          status: months === 0 ? 'expired' : getWarrantyStatus(now, safeEndDate),
        } as Warranty);
      }

      return {
        ...p,
        stock: Math.max(0, p.stock - cartItem.quantity),
        updatedAt: now,
      };
    });

    // Mark matched serials as sold
    const updatedSerials = currentSerials.map((s) => {
      if (assignedSerials.includes(s.serialNumber)) {
        return {
          ...s,
          status: 'sold' as SerialStatus,
          dateSold: now,
          customerRef: input.customer.name,
        };
      }
      return s;
    });

    const totalProfit = totalSellingCost - totalPurchaseCost - (input.discount || 0);

    const businessInfo: BusinessInfo = {
      name: currentSettings.storeName || 'ElectroStock Electronics',
      legalName: 'ElectroStock Retail Solutions Pvt Ltd',
      address: currentSettings.storeAddress || 'Electronics Hub, Tech City, Karnataka 560001',
      phone: currentSettings.storePhone || '+91 98765 43210',
      email: currentSettings.storeEmail || 'support@electrostock.internal',
      gstin: '29AABCE1234F1Z9',
      website: 'https://electrostock.internal',
    };

    const receipt: SaleReceipt = {
      receiptNumber,
      transactionId: parentTxnId,
      date: now,
      businessInfo,
      customer: input.customer,
      items: input.items,
      subtotal: input.subtotal,
      discount: input.discount,
      taxRate: input.taxRate ?? (currentSettings.taxRate || 18),
      taxAmount: Math.round(((input.grandTotal * 18) / 118)),
      grandTotal: input.grandTotal,
      paymentMethod: input.paymentMethod,
      paymentStatus: 'completed',
      paymentReference: input.paymentReference,
      paymentDetails: input.paymentDetails,
      totalProfit,
      notes: input.notes,
    };

    set((state) => {
      const nextReceipts = [receipt, ...state.receipts];
      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem('electrostock_sales_receipts', JSON.stringify(nextReceipts.slice(0, 50)));
        } catch (err) {
          console.warn('Failed to save receipts in localStorage:', err);
        }
      }
      return {
        products: updatedProducts,
        serials: updatedSerials,
        transactions: [...generatedTransactions, ...state.transactions],
        warranties: [...newWarranties, ...state.warranties],
        receipts: nextReceipts,
      };
    });

    try {
      get().generateAlerts();
    } catch (e) {
      console.warn('Failed to update alerts:', e);
    }

    get().addAuditLog({
      action: 'payment_completed',
      actionLabel: 'Payment Completed',
      userName: userName || 'Store Cashier',
      userId: userId || 'user-3',
      relatedId: receipt.receiptNumber,
      description: `Completed sale #${receipt.receiptNumber} (${receipt.items.length} products, ₹${receipt.grandTotal}) via ${receipt.paymentMethod.toUpperCase()} for customer ${receipt.customer.name}`,
    });

    return {
      success: true,
      receipt,
      transactions: generatedTransactions,
    };
  },

  getReceipt: (receiptNumber) => {
    return get().receipts.find((r) => r.receiptNumber === receiptNumber);
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

  addWarranty: (input) => {
    const product = get().products.find((p) => p.id === input.productId);
    const startDate = input.startDate ? new Date(input.startDate) : new Date();
    const endDate = new Date(startDate);
    const duration = typeof input.durationMonths === 'number' ? input.durationMonths : 12;
    endDate.setMonth(endDate.getMonth() + duration);
    const warranty: Warranty = {
      id: generateId('war-'),
      productId: input.productId,
      productName: product?.name ?? 'Unknown Product',
      serialNumber: input.serialNumber,
      customerRef: input.customerRef,
      customerName: input.customerName,
      customerEmail: input.customerEmail,
      customerPhone: input.customerPhone,
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
      status: getWarrantyStatus(startDate.toISOString(), endDate.toISOString()),
      notes: input.notes,
      claims: [],
    };
    set((state) => ({ warranties: [warranty, ...state.warranties] }));
    get().generateAlerts();
    return warranty;
  },

  claimWarranty: (warrantyId, issueDescription, status = 'in_repair', notes = '') => {
    const w = get().warranties.find((x) => x.id === warrantyId);
    if (!w) return { success: false, error: 'Warranty not found' };
    const claim: WarrantyClaim = {
      id: generateId('clm-'),
      warrantyId,
      date: new Date().toISOString(),
      issueDescription,
      status,
      resolutionNotes: notes,
    };
    set((state) => ({
      warranties: state.warranties.map((x) =>
        x.id === warrantyId
          ? { ...x, claims: [...(x.claims || []), claim] }
          : x
      ),
    }));
    return { success: true };
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
    get().addAuditLog({
      action: 'purchase_order_created',
      actionLabel: 'PO Created',
      userName,
      userId,
      relatedId: po.poNumber,
      description: `Drafted purchase order ${po.poNumber} for vendor ${po.supplierName} (${po.items.length} items, ₹${po.totalCost})`,
    });
    return po;
  },

  updatePOStatus: (id, status) => {
    const po = get().purchaseOrders.find((p) => p.id === id);
    if (!po) return { success: false, error: 'Purchase order not found' };

    const validTransitions: Record<PurchaseOrderStatus, PurchaseOrderStatus[]> = {
      draft: ['pending', 'approved', 'cancelled'],
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

    if (status === 'approved') {
      get().addAuditLog({
        action: 'purchase_order_approved',
        actionLabel: 'PO Approved',
        relatedId: po.poNumber,
        description: `Approved purchase order ${po.poNumber} for ${po.supplierName}`,
      });
    }

    return { success: true };
  },

  receivePurchaseOrder: (id, userName, userId) => {
    const po = get().purchaseOrders.find((p) => p.id === id);
    if (!po) return { success: false, error: 'Purchase order not found' };
    if (po.status !== 'ordered' && po.status !== 'partially_received' && po.status !== 'approved') {
      return { success: false, error: `Purchase order cannot be received in ${po.status} state. It must be approved or ordered first.` };
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

    get().addAuditLog({
      action: 'stock_received',
      actionLabel: 'Stock Received',
      userName,
      userId,
      relatedId: po.poNumber,
      description: `Inwarded all stock items from PO ${po.poNumber} (${po.items.reduce((s, i) => s + i.quantity, 0)} units total)`,
    });

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
    get().addAuditLog({
      action: 'user_created',
      actionLabel: 'User Account Created',
      relatedId: user.id,
      description: `Created new user account for ${user.name} (${user.email}) with role ${user.role}`,
    });
  },

  updateUser: (id, input) => {
    set((state) => ({
      users: state.users.map((u) => (u.id === id ? { ...u, ...input } : u)),
    }));
    get().addAuditLog({
      action: 'user_updated',
      actionLabel: 'User Details Updated',
      relatedId: id,
      description: `Updated account details for user ${input.name || id}`,
    });
  },

  deleteUser: (id) => {
    const u = get().users.find((usr) => usr.id === id);
    set((state) => ({ users: state.users.filter((user) => user.id !== id) }));
    get().addAuditLog({
      action: 'user_deleted',
      actionLabel: 'User Deleted',
      relatedId: id,
      description: `Permanently removed user account for ${u?.name || id}`,
    });
  },

  updateUserRole: (id, role) => {
    const u = get().users.find((usr) => usr.id === id);
    set((state) => ({
      users: state.users.map((user) => (user.id === id ? { ...user, role } : user)),
    }));
    get().addAuditLog({
      action: 'user_updated',
      actionLabel: 'User Role Changed',
      relatedId: id,
      description: `Changed role of ${u?.name || id} to ${role}`,
    });
  },

  toggleUserStatus: (id) => {
    const u = get().users.find((usr) => usr.id === id);
    const nextStatus = u?.status === 'active' ? 'inactive' : 'active';
    set((state) => ({
      users: state.users.map((user) =>
        user.id === id ? { ...user, status: nextStatus } : user
      ),
    }));
    get().addAuditLog({
      action: 'user_status_changed',
      actionLabel: 'User Status Toggled',
      relatedId: id,
      description: `Changed account status of ${u?.name || id} to ${nextStatus}`,
    });
  },

  updateSettings: (partial) => {
    set((state) => ({
      settings: { ...state.settings, ...partial },
    }));
    get().addAuditLog({
      action: 'settings_updated',
      actionLabel: 'Settings Updated',
      relatedId: 'SYS-CONFIG',
      description: 'System organization settings and reordering rules updated',
    });
  },

  resetDemoData: () => {
    if (typeof window !== 'undefined') {
      try {
        localStorage.removeItem('electrostock_sales_receipts');
      } catch (e) {}
    }
    set({
      products: mockProducts,
      categories: recalcCategories(mockProducts, mockCategories),
      suppliers: mockSuppliers,
      transactions: mockTransactions,
      purchaseOrders: mockPurchaseOrders,
      serials: mockSerials,
      warranties: mockWarranties,
      users: mockUsers,
      settings: defaultSettings,
      receipts: [],
      auditLogs: mockAuditLogs,
    });
    get().generateAlerts();
  },
}),
    {
      name: 'electrostock_inventory_state',
      partialize: (state) => ({
        products: state.products,
        categories: state.categories,
        suppliers: state.suppliers,
        transactions: state.transactions,
        purchaseOrders: state.purchaseOrders,
        serials: state.serials,
        warranties: state.warranties,
        users: state.users,
        settings: state.settings,
        receipts: state.receipts,
        auditLogs: state.auditLogs,
      }),
    }
  )
);
