import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  const serials = await db.serial.findMany({ orderBy: { dateAdded: 'desc' } });
  return NextResponse.json(serials);
}

export async function POST(req: Request) {
  const body = await req.json();
  const serial = await db.serial.create({
    data: {
      id: body.id || `ser-${Date.now()}`,
      productId: body.productId,
      productName: body.productName,
      serialNumber: body.serialNumber,
      imei: body.imei ?? null,
      status: body.status ?? 'available',
      warrantyId: body.warrantyId ?? null,
      dateAdded: body.dateAdded ? new Date(body.dateAdded) : new Date(),
      dateSold: body.dateSold ? new Date(body.dateSold) : null,
      customerRef: body.customerRef ?? null,
    },
  });
  return NextResponse.json(serial, { status: 201 });
}
