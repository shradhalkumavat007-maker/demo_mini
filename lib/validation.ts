import { z } from 'zod';

export const productSchema = z.object({
  name: z.string().min(1, 'Product name is required'),
  sku: z.string().min(1, 'SKU is required').min(3, 'SKU must be at least 3 characters'),
  categoryId: z.string().min(1, 'Category is required'),
  brand: z.string().min(1, 'Brand is required'),
  model: z.string().min(1, 'Model is required'),
  supplierId: z.string().min(1, 'Supplier is required'),
  minStock: z.number().int('Minimum stock must be a whole number').min(0, 'Minimum stock cannot be negative'),
  purchasePrice: z.number().min(0, 'Purchase price cannot be negative'),
  sellingPrice: z.number().min(0, 'Selling price cannot be negative'),
  warrantyPeriodMonths: z.number().int().min(0, 'Warranty period cannot be negative'),
  description: z.string().optional().default(''),
});

export const supplierSchema = z.object({
  name: z.string().min(1, 'Supplier name is required'),
  company: z.string().min(1, 'Company name is required'),
  phone: z.string().min(10, 'Phone number must be at least 10 digits'),
  email: z.string().email('Invalid email address'),
  address: z.string().min(1, 'Address is required'),
  gstin: z.string().optional().default(''),
  status: z.enum(['active', 'inactive']),
});

export const stockInSchema = z.object({
  productId: z.string().min(1, 'Product is required'),
  supplierId: z.string().min(1, 'Supplier is required'),
  quantity: z.number().int().min(1, 'Quantity must be greater than zero'),
  purchasePrice: z.number().min(0, 'Purchase price cannot be negative'),
  date: z.string().min(1, 'Date is required'),
  reference: z.string().optional().default(''),
  notes: z.string().optional().default(''),
});

export const stockOutSchema = z.object({
  productId: z.string().min(1, 'Product is required'),
  quantity: z.number().int().min(1, 'Quantity must be greater than zero'),
  sellingPrice: z.number().min(0, 'Selling price cannot be negative'),
  date: z.string().min(1, 'Date is required'),
  customerRef: z.string().min(1, 'Customer / Reference is required'),
  notes: z.string().optional().default(''),
});

export const purchaseOrderSchema = z.object({
  supplierId: z.string().min(1, 'Supplier is required'),
  expectedDate: z.string().min(1, 'Expected date is required'),
  notes: z.string().optional().default(''),
  items: z.array(
    z.object({
      productId: z.string().min(1),
      quantity: z.number().int().min(1, 'Quantity must be greater than zero'),
      unitPrice: z.number().min(0, 'Unit price cannot be negative'),
    })
  ).min(1, 'At least one item is required'),
});

export const userSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email address'),
  role: z.enum(['admin', 'manager', 'staff']),
  status: z.enum(['active', 'inactive']),
});

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});
