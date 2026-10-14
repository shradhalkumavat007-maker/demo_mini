import { NextRequest, NextResponse } from 'next/server';
import { stockInSchema } from '@/lib/validation';
import { db } from '@/lib/db';

export async function GET() {
  return NextResponse.json({ status: 'online', endpoint: '/api/inventory/stock-in' });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null);
    if (!body) return NextResponse.json({ success: false, error: 'Invalid JSON' }, { status: 400 });

    const validation = stockInSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json({ success: false, error: 'Validation error', issues: validation.error.issues }, { status: 400 });
    }

    const { productId, supplierId, quantity, purchasePrice, date, reference, notes, serialNumbers } = validation.data as any;
    const qty = Math.max(1, Number(quantity) || 1);
    const unitCost = Math.max(0, Number(purchasePrice) || 0);
    const totalValue = qty * unitCost;

    // Persist transaction to SQLite
    const txId = `txn-in-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    const product = await db.product.findUnique({ where: { id: productId }, select: { id: true, name: true, stock: true } });
    if (!product) {
      return NextResponse.json({ success: false, error: `Product "${productId}" not found in database.` }, { status: 404 });
    }

    const createdTx = await db.transaction.create({
      data: {
        id: txId,
        productId,
        productName: product.name,
        type: 'stock_in',
        quantity: qty,
        unitPrice: unitCost,
        totalValue,
        purchaseCost: unitCost,
        reference: reference ?? '',
        date: date ? new Date(date) : new Date(),
        notes: notes ?? '',
        serialNumbers: JSON.stringify(Array.isArray(serialNumbers) ? serialNumbers : []),
      },
    });

    // Update stock count and purchase price in SQLite
    const updatedProduct = await db.product.update({
      where: { id: productId },
      data: {
        stock: { increment: qty },
        ...(unitCost > 0 ? { purchasePrice: unitCost } : {}),
      },
    });

    // Save serials if provided
    if (Array.isArray(serialNumbers) && serialNumbers.length > 0) {
      for (const sn of serialNumbers) {
        if (typeof sn === 'string' && sn.trim()) {
          const cleanSn = sn.trim();
          await db.serial.upsert({
            where: { serialNumber: cleanSn },
            update: { status: 'available', productId, productName: product.name },
            create: {
              id: `ser-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
              productId,
              productName: product.name,
              serialNumber: cleanSn,
              status: 'available',
            },
          }).catch(() => {});
        }
      }
    }

    // Dual-sync to Java Backend / Oracle XE if reachable
    try {
      fetch('http://localhost:8085/api/inventory/stock-in', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId, quantity: qty, purchasePrice: unitCost, reference, notes }),
      }).catch(() => {});
    } catch {}

    return NextResponse.json({
      success: true,
      message: `Stocked in ${qty} unit(s) of ${product.name}. New stock: ${updatedProduct.stock}.`,
      transaction: {
        id: txId,
        productId,
        productName: product.name,
        type: 'stock_in',
        quantity: qty,
        unitPrice: unitCost,
        totalValue,
        purchaseCost: unitCost,
        profitLoss: 0,
        date: createdTx.date.toISOString(),
        reference: reference ?? '',
        customerRef: '',
        notes: notes ?? '',
        serialNumbers: Array.isArray(serialNumbers) ? serialNumbers : [],
      },
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error?.message || 'Internal server error during Stock In' }, { status: 500 });
  }
}
