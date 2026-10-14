export interface Supplier {
  id: string;
  name: string;
  company: string;
  phone: string;
  email: string;
  address: string;
  gstin: string;
  status: 'active' | 'inactive';
  createdAt: string;
}

export interface SupplierInput {
  name: string;
  company: string;
  phone: string;
  email: string;
  address: string;
  gstin: string;
  status: 'active' | 'inactive';
}
