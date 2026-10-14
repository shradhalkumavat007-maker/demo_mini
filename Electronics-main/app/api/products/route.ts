import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const products = await db.product.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json(products);
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || 'Failed to fetch products' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const productId = body.id || `prod-${Date.now()}`;

    // 1. Check duplicate SKU upfront for clear error reporting
    if (body.sku) {
      const existingBySku = await db.product.findUnique({ where: { sku: body.sku } });
      if (existingBySku) {
        return NextResponse.json(
          { error: `Product with SKU "${body.sku}" already exists (${existingBySku.name}).` },
          { status: 400 }
        );
      }
    }

    // 2. Ensure Category Foreign Key exists in SQLite database
    let categoryId = body.categoryId;
    if (categoryId) {
      const catById = await db.category.findUnique({ where: { id: categoryId } });
      if (!catById) {
        const catByName = await db.category.findUnique({ where: { name: categoryId } });
        if (catByName) {
          categoryId = catByName.id;
        } else {
          try {
            const newCat = await db.category.create({
              data: {
                id: categoryId.startsWith('cat-') ? categoryId : `cat-${Date.now()}`,
                name: body.categoryName || categoryId,
                description: 'Auto-created category',
              },
            });
            categoryId = newCat.id;
          } catch {
            const fallback = await db.category.findFirst();
            if (fallback) categoryId = fallback.id;
          }
        }
      }
    } else {
      const fallback = await db.category.findFirst();
      categoryId = fallback ? fallback.id : 'cat-1';
    }

    // 3. Ensure Supplier Foreign Key exists in SQLite database
    let supplierId = body.supplierId;
    if (supplierId) {
      const supById = await db.supplier.findUnique({ where: { id: supplierId } });
      if (!supById) {
        const supByCompany = await db.supplier.findFirst({
          where: { OR: [{ company: supplierId }, { name: supplierId }] },
        });
        if (supByCompany) {
          supplierId = supByCompany.id;
        } else {
          try {
            const newSup = await db.supplier.create({
              data: {
                id: supplierId.startsWith('sup-') ? supplierId : `sup-${Date.now()}`,
                name: body.supplierName || 'General Supplier',
                company: body.supplierCompany || supplierId,
                phone: '+91 98000 00000',
                email: 'vendor@electrostock.local',
                address: 'Registered Vendor',
                status: 'active',
              },
            });
            supplierId = newSup.id;
          } catch {
            const fallback = await db.supplier.findFirst();
            if (fallback) supplierId = fallback.id;
          }
        }
      }
    } else {
      const fallback = await db.supplier.findFirst();
      supplierId = fallback ? fallback.id : 'sup-1';
    }

    const productData = {
      id: productId,
      name: body.name,
      sku: body.sku,
      categoryId,
      brand: body.brand,
      model: body.model,
      supplierId,
      stock: Number(body.stock ?? 0),
      minStock: Number(body.minStock ?? 5),
      purchasePrice: Number(body.purchasePrice ?? 0),
      sellingPrice: Number(body.sellingPrice ?? 0),
      warrantyPeriodMonths: Number(body.warrantyPeriodMonths ?? 0),
      description: body.description ?? '',
      imageUrl: body.imageUrl ?? null,
    };

    const product = await db.product.create({
      data: productData,
    });

    // Dual-sync to Java Backend / Oracle XE if reachable
    try {
      fetch('http://localhost:8085/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(productData),
      }).catch(() => {});
    } catch {}

    return NextResponse.json(product, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || 'Failed to create product' }, { status: 400 });
  }
}
