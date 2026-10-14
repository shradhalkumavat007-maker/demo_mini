import { NextRequest, NextResponse } from 'next/server';
import { stockOutSchema } from '@/lib/validation';
import { db } from '@/lib/db';

export async function GET() {
  return NextResponse.json({ status: 'online', endpoint: '/api/inventory/stock-out' });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null);
    if (!body) return NextResponse.json({ success: false, error: 'Invalid JSON' }, { status: 400 });

    const validation = stockOutSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json({ success: false, error: 'Validation error', issues: validation.error.issues }, { status: 400 });
    }

    const { productId, quantity, sellingPrice, date, customerRef, notes, serialNumbers } = validation.data as any;
    const qty = Math.max(1, Number(quantity) || 1);
    const unitPrice = Math.max(0, Number(sellingPrice) || 0);
    const totalValue = qty * unitPrice;

    const txId = `txn-out-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    const product = await db.product.findUnique({ where: { id: productId } });
    if (!product) {
      return NextResponse.json({ success: false, error: `Product "${productId}" not found in database.` }, { status: 404 });
    }
    if (product.stock < qty) {
      return NextResponse.json({
        success: false,
        error: `Insufficient stock! Product "${product.name}" has only ${product.stock} units available, but ${qty} were requested.`,
      }, { status: 400 });
    }

    const purchaseCost = (product.purchasePrice ?? 0) * qty;
    const profitLoss = totalValue - purchaseCost;

    const createdTx = await db.transaction.create({
      data: {
        id: txId,
        productId,
        productName: product.name,
        type: 'stock_out',
        quantity: qty,
        unitPrice,
        totalValue,
        purchaseCost,
        profitLoss,
        date: date ? new Date(date) : new Date(),
        customerRef: customerRef ?? '',
        notes: notes ?? '',
        serialNumbers: JSON.stringify(Array.isArray(serialNumbers) ? serialNumbers : []),
      },
    });

    // Update stock count in SQLite
    const updatedProduct = await db.product.update({
      where: { id: productId },
      data: { stock: { decrement: qty } },
    });

    // Update serials to sold if provided
    if (Array.isArray(serialNumbers) && serialNumbers.length > 0) {
      for (const sn of serialNumbers) {
        if (typeof sn === 'string' && sn.trim()) {
          await db.serial.updateMany({
            where: { serialNumber: sn.trim() },
            data: { status: 'sold', customerRef: customerRef ?? '', dateSold: new Date() },
          }).catch(() => {});
        }
      }
    }

    // Dual-sync to Java Backend / Oracle XE if reachable
    try {
      fetch('http://localhost:8085/api/inventory/stock-out', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId, quantity: qty, sellingPrice: unitPrice, customerRef, notes }),
      }).catch(() => {});
    } catch {}

    return NextResponse.json({
      success: true,
      message: `Stocked out ${qty} unit(s) of ${product.name}. Remaining stock: ${updatedProduct.stock}.`,
      transaction: {
        id: txId,
        productId,
        productName: product.name,
        type: 'stock_out',
        quantity: qty,
        unitPrice,
        totalValue,
        purchaseCost,
        profitLoss,
        date: createdTx.date.toISOString(),
        reference: '',
        customerRef: customerRef ?? '',
        notes: notes ?? '',
        serialNumbers: Array.isArray(serialNumbers) ? serialNumbers : [],
      },
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error?.message || 'Internal server error during Stock Out' }, { status: 500 });
  }
}
