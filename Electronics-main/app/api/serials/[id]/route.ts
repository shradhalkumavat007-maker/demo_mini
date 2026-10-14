import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const body = await req.json();
  try {
    const serial = await db.serial.update({
      where: { id: params.id },
      data: {
        status: body.status,
        dateSold: body.dateSold ? new Date(body.dateSold) : undefined,
        customerRef: body.customerRef,
        warrantyId: body.warrantyId,
      },
    });
    return NextResponse.json(serial);
  } catch {
    return NextResponse.json({ error: 'Update failed' }, { status: 400 });
  }
}
