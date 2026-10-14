import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { mockCategories } from '@/data/mock-categories';
import { mockSuppliers } from '@/data/mock-suppliers';
import { mockProducts } from '@/data/mock-products';
import { mockSerials } from '@/data/mock-serials';
import { mockUsers } from '@/data/mock-users';

// GET /api/db/seed — seeds database with demo data if empty
// Safe to call multiple times (idempotent via upsert)
export async function GET() {
  try {
    // Categories
    for (const c of mockCategories) {
      await db.category.upsert({
        where: { id: c.id },
        update: {},
        create: { id: c.id, name: c.name, description: c.description },
      });
    }

    // Suppliers
    for (const s of mockSuppliers) {
      await db.supplier.upsert({
        where: { id: s.id },
        update: {},
        create: {
          id: s.id,
          name: s.name,
          company: s.company,
          phone: s.phone,
          email: s.email,
          address: s.address,
          gstin: s.gstin,
          status: s.status,
          createdAt: new Date(s.createdAt),
        },
      });
    }

    // Products
    for (const p of mockProducts) {
      await db.product.upsert({
        where: { id: p.id },
        update: {},
        create: {
          id: p.id,
          name: p.name,
          sku: p.sku,
          categoryId: p.categoryId,
          brand: p.brand,
          model: p.model,
          supplierId: p.supplierId,
          stock: p.stock,
          minStock: p.minStock,
          purchasePrice: p.purchasePrice,
          sellingPrice: p.sellingPrice,
          warrantyPeriodMonths: p.warrantyPeriodMonths,
          description: p.description,
          imageUrl: p.imageUrl,
          createdAt: new Date(p.createdAt),
        },
      });
    }

    // Serials
    for (const ser of mockSerials) {
      await db.serial.upsert({
        where: { serialNumber: ser.serialNumber },
        update: {},
        create: {
          id: ser.id,
          productId: ser.productId,
          productName: ser.productName,
          serialNumber: ser.serialNumber,
          imei: ser.imei,
          status: ser.status,
          warrantyId: ser.warrantyId,
          dateAdded: new Date(ser.dateAdded),
          dateSold: ser.dateSold ? new Date(ser.dateSold) : null,
          customerRef: ser.customerRef,
        },
      });
    }

    // Users
    for (const u of mockUsers) {
      await db.user.upsert({
        where: { id: u.id },
        update: {},
        create: {
          id: u.id,
          name: u.name,
          email: u.email,
          role: u.role,
          phone: (u as any).phone || '',
          status: u.status,
          createdAt: new Date(u.createdAt),
        },
      });
    }

    const [productCount, categoryCount, supplierCount, serialCount] = await Promise.all([
      db.product.count(),
      db.category.count(),
      db.supplier.count(),
      db.serial.count(),
    ]);

    return NextResponse.json({
      success: true,
      message: 'Database seeded successfully',
      counts: {
        products: productCount,
        categories: categoryCount,
        suppliers: supplierCount,
        serials: serialCount,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
