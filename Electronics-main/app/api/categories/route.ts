import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  const categories = await db.category.findMany({ orderBy: { name: 'asc' } });
  // Add productCount
  const withCount = await Promise.all(
    categories.map(async (c) => ({
      ...c,
      productCount: await db.product.count({ where: { categoryId: c.id } }),
    }))
  );
  return NextResponse.json(withCount);
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    if (!body?.name?.trim()) {
      return NextResponse.json({ error: 'Category name is required' }, { status: 400 });
    }
    const cleanName = body.name.trim();
    const existing = await db.category.findUnique({ where: { name: cleanName } });
    if (existing) {
      const productCount = await db.product.count({ where: { categoryId: existing.id } });
      return NextResponse.json({ ...existing, productCount }, { status: 200 });
    }
    const category = await db.category.create({
      data: {
        id: body.id || `cat-${Date.now()}`,
        name: cleanName,
        description: body.description ?? '',
      },
    });
    return NextResponse.json({ ...category, productCount: 0 }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || 'Failed to create category' }, { status: 400 });
  }
}
