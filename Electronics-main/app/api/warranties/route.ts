import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  const warranties = await db.warranty.findMany({
    include: { claims: true },
    orderBy: { createdAt: 'desc' },
  });
  return NextResponse.json(warranties);
}

export async function POST(req: Request) {
  const body = await req.json();
  const warranty = await db.warranty.create({
    data: {
      id: body.id || `war-${Date.now()}`,
      productId: body.productId,
      productName: body.productName,
      serialNumber: body.serialNumber,
      customerRef: body.customerRef,
      customerName: body.customerName ?? null,
      customerEmail: body.customerEmail ?? null,
      customerPhone: body.customerPhone ?? null,
      startDate: new Date(body.startDate),
      endDate: new Date(body.endDate),
      status: body.status ?? 'active',
      notes: body.notes ?? null,
    },
    include: { claims: true },
  });
  return NextResponse.json(warranty, { status: 201 });
}
