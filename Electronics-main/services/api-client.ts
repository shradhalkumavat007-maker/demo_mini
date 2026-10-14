/**
 * ElectroStock API Client
 * Connects to Next.js API routes backed by SQLite via Prisma.
 * Falls back gracefully — store stays in-memory if API fails.
 */

const getApiBase = () => {
  const envUrl = process.env.NEXT_PUBLIC_API_URL;
  if (!envUrl || envUrl.includes('localhost:8085') || envUrl.includes('localhost:8080')) {
    return '/api';
  }
  return envUrl;
};

const API_BASE = getApiBase();

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(`${API_BASE}${endpoint}`, {
    headers: { 'Content-Type': 'application/json', ...options.headers },
    ...options,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || `HTTP ${res.status}: Failed to communicate with server`);
  }
  return res.json();
}

export const apiClient = {
  // Products
  getProducts: () => request<any[]>('/products'),
  getProduct: (id: string) => request<any>(`/products/${id}`),
  createProduct: (data: any) => request<any>('/products', { method: 'POST', body: JSON.stringify(data) }),
  updateProduct: (id: string, data: any) => request<any>(`/products/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteProduct: (id: string) => request<any>(`/products/${id}`, { method: 'DELETE' }),

  // Categories
  getCategories: () => request<any[]>('/categories'),
  createCategory: (data: { id?: string; name: string; description: string }) =>
    request<any>('/categories', { method: 'POST', body: JSON.stringify(data) }),
  updateCategory: (id: string, data: { name: string; description: string }) =>
    request<any>(`/categories/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteCategory: (id: string) => request<any>(`/categories/${id}`, { method: 'DELETE' }),

  // Suppliers
  getSuppliers: () => request<any[]>('/suppliers'),
  createSupplier: (data: any) => request<any>('/suppliers', { method: 'POST', body: JSON.stringify(data) }),
  updateSupplier: (id: string, data: any) => request<any>(`/suppliers/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteSupplier: (id: string) => request<any>(`/suppliers/${id}`, { method: 'DELETE' }),

  // Transactions
  getTransactions: () => request<any[]>('/transactions'),
  createTransaction: (data: any) => request<any>('/transactions', { method: 'POST', body: JSON.stringify(data) }),

  // Serials
  getSerials: () => request<any[]>('/serials'),
  createSerial: (data: any) => request<any>('/serials', { method: 'POST', body: JSON.stringify(data) }),
  updateSerialStatus: (id: string, data: any) => request<any>(`/serials/${id}`, { method: 'PUT', body: JSON.stringify(data) }),

  // Warranties
  getWarranties: () => request<any[]>('/warranties'),
  createWarranty: (data: any) => request<any>('/warranties', { method: 'POST', body: JSON.stringify(data) }),
  claimWarranty: (id: string, data: any) =>
    request<any>(`/warranties/${id}/claims`, { method: 'POST', body: JSON.stringify(data) }),

  // Receipts
  getReceipts: () => request<any[]>('/receipts'),
  createReceipt: (data: any) => request<any>('/receipts', { method: 'POST', body: JSON.stringify(data) }),

  // DB utilities
  seedDatabase: () => request<any>('/db/seed'),
  getHealth: () => request<any>('/health'),

  // Legacy aliases kept for compatibility
  stockIn: (data: any) => request<any>('/inventory/stock-in', { method: 'POST', body: JSON.stringify(data) }),
  stockOut: (data: any) => request<any>('/inventory/stock-out', { method: 'POST', body: JSON.stringify(data) }),
  processSale: (data: any) => request<any>('/receipts', { method: 'POST', body: JSON.stringify(data) }),
  createPurchaseOrder: (data: any) => Promise.resolve(data),
  createUser: (data: any) => Promise.resolve(data),
  login: (credentials: { email: string; password?: string }) =>
    request<any>('/auth/login', { method: 'POST', body: JSON.stringify(credentials) }),
};
