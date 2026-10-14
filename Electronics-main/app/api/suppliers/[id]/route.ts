import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const body = await req.json();
  try {
    const supplier = await db.supplier.update({
      where: { id: params.id },
      data: {
        name: body.name,
        company: body.company,
        phone: body.phone,
        email: body.email,
        address: body.address,
        gstin: body.gstin,
        status: body.status,
      },
    });
    return NextResponse.json(supplier);
  } catch {
    return NextResponse.json({ error: 'Update failed' }, { status: 400 });
  }
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  try {
    await db.supplier.delete({ where: { id: params.id } });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Delete failed' }, { status: 400 });
  }
}
