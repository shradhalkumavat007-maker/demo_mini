import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  const receipts = await db.receipt.findMany({ orderBy: { createdAt: 'desc' } });
  return NextResponse.json(receipts.map((r) => JSON.parse(r.data)));
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const receiptNumber = body.receiptNumber || `RCP-${Date.now()}`;
    const existing = await db.receipt.findUnique({ where: { receiptNumber } });
    if (existing) {
      return NextResponse.json({ ...body, dbId: existing.id }, { status: 200 });
    }
    const receipt = await db.receipt.create({
      data: {
        id: body.id || `rec-${Date.now()}`,
        receiptNumber,
        data: JSON.stringify(body),
      },
    });
    return NextResponse.json({ ...body, dbId: receipt.id }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Failed to save receipt' }, { status: 400 });
  }
}
