import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  const suppliers = await db.supplier.findMany({ orderBy: { createdAt: 'desc' } });
  return NextResponse.json(suppliers);
}

export async function POST(req: Request) {
  const body = await req.json();
  const supplier = await db.supplier.create({
    data: {
      id: body.id || `sup-${Date.now()}`,
      name: body.name,
      company: body.company,
      phone: body.phone,
      email: body.email,
      address: body.address,
      gstin: body.gstin ?? '',
      status: body.status ?? 'active',
    },
  });
  return NextResponse.json(supplier, { status: 201 });
}
