import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const [products, categories, suppliers, serials, warranties, transactions] = await Promise.all([
      db.product.count(),
      db.category.count(),
      db.supplier.count(),
      db.serial.count(),
      db.warranty.count(),
      db.transaction.count(),
    ]);
    return NextResponse.json({
      status: 'ok',
      database: 'SQLite (Prisma)',
      counts: { products, categories, suppliers, serials, warranties, transactions },
    });
  } catch (error: any) {
    return NextResponse.json({ status: 'error', error: error.message }, { status: 500 });
  }
}
