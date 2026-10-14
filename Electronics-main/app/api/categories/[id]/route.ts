import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const body = await req.json();
  try {
    const category = await db.category.update({
      where: { id: params.id },
      data: { name: body.name, description: body.description },
    });
    const productCount = await db.product.count({ where: { categoryId: params.id } });
    return NextResponse.json({ ...category, productCount });
  } catch {
    return NextResponse.json({ error: 'Update failed' }, { status: 400 });
  }
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  try {
    await db.category.delete({ where: { id: params.id } });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Delete failed — may have products' }, { status: 400 });
  }
}
