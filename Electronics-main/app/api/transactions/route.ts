import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const transactions = await db.transaction.findMany({ orderBy: { date: 'desc' } });
    return NextResponse.json(
      transactions.map((t) => {
        let parsedSerials: string[] = [];
        try {
          parsedSerials = typeof t.serialNumbers === 'string' ? JSON.parse(t.serialNumbers || '[]') : (t.serialNumbers || []);
        } catch {
          parsedSerials = [];
        }
        return {
          ...t,
          serialNumbers: parsedSerials,
        };
      })
    );
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || 'Failed to fetch transactions' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const body = await req.json();
  const tx = await db.transaction.create({
    data: {
      id: body.id || `tx-${Date.now()}`,
      productId: body.productId,
      productName: body.productName,
      type: body.type,
      quantity: Number(body.quantity),
      unitPrice: Number(body.unitPrice),
      totalValue: Number(body.totalValue),
      purchaseCost: Number(body.purchaseCost ?? 0),
      profitLoss: Number(body.profitLoss ?? 0),
      date: body.date ? new Date(body.date) : new Date(),
      userId: body.userId ?? '',
      userName: body.userName ?? '',
      reference: body.reference ?? '',
      customerRef: body.customerRef ?? '',
      notes: body.notes ?? '',
      serialNumbers: JSON.stringify(body.serialNumbers ?? []),
    },
  });
  return NextResponse.json({ ...tx, serialNumbers: body.serialNumbers ?? [] }, { status: 201 });
}
