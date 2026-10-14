import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const product = await db.product.findUnique({ where: { id: params.id } });
  if (!product) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json(product);
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const body = await req.json();
  try {
    let categoryId = body.categoryId;
    if (categoryId) {
      const cat = await db.category.findUnique({ where: { id: categoryId } });
      if (!cat) {
        const catByName = await db.category.findUnique({ where: { name: categoryId } });
        if (catByName) categoryId = catByName.id;
        else {
          try {
            const newCat = await db.category.create({
              data: { id: categoryId.startsWith('cat-') ? categoryId : `cat-${Date.now()}`, name: categoryId, description: '' },
            });
            categoryId = newCat.id;
          } catch {
            const fallback = await db.category.findFirst();
            if (fallback) categoryId = fallback.id;
          }
        }
      }
    }

    let supplierId = body.supplierId;
    if (supplierId) {
      const sup = await db.supplier.findUnique({ where: { id: supplierId } });
      if (!sup) {
        const supMatch = await db.supplier.findFirst({
          where: { OR: [{ company: supplierId }, { name: supplierId }] },
        });
        if (supMatch) supplierId = supMatch.id;
        else {
          try {
            const newSup = await db.supplier.create({
              data: {
                id: supplierId.startsWith('sup-') ? supplierId : `sup-${Date.now()}`,
                name: 'General Supplier',
                company: supplierId,
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
    }

    const product = await db.product.update({
      where: { id: params.id },
      data: {
        name: body.name,
        sku: body.sku,
        ...(categoryId ? { categoryId } : {}),
        brand: body.brand,
        model: body.model,
        ...(supplierId ? { supplierId } : {}),
        stock: body.stock !== undefined ? Number(body.stock) : undefined,
        minStock: body.minStock !== undefined ? Number(body.minStock) : undefined,
        purchasePrice: body.purchasePrice !== undefined ? Number(body.purchasePrice) : undefined,
        sellingPrice: body.sellingPrice !== undefined ? Number(body.sellingPrice) : undefined,
        warrantyPeriodMonths: body.warrantyPeriodMonths !== undefined ? Number(body.warrantyPeriodMonths) : undefined,
        description: body.description,
        imageUrl: body.imageUrl,
      },
    });

    // Dual-sync to Java Backend if running
    try {
      fetch(`http://localhost:8085/api/products/${params.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      }).catch(() => {});
    } catch {}

    return NextResponse.json(product);
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || 'Update failed' }, { status: 400 });
  }
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  try {
    await db.serial.deleteMany({ where: { productId: params.id } }).catch(() => {});
    await db.transaction.deleteMany({ where: { productId: params.id } }).catch(() => {});
    await db.warranty.deleteMany({ where: { productId: params.id } }).catch(() => {});
    await db.product.delete({ where: { id: params.id } });

    // Dual-sync to Java Backend if running
    try {
      fetch(`http://localhost:8085/api/products/${params.id}`, {
        method: 'DELETE',
      }).catch(() => {});
    } catch {}

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || 'Delete failed' }, { status: 400 });
  }
}
