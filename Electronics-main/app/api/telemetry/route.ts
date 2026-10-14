import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { level = 'info', source = 'CLIENT', message = '', meta } = body;
    const time = new Date().toLocaleTimeString('en-US', { hour12: false });

    const prefix = level === 'error'
      ? `\x1b[31m[NEXT ERR ${time}]\x1b[0m`
      : level === 'warn'
      ? `\x1b[33m[NEXT WARN ${time}]\x1b[0m`
      : `\x1b[36m[NEXT ${time}]\x1b[0m`;

    const tag = `\x1b[1m[${source}]\x1b[0m`;

    console.log(`${prefix} ${tag} ${message}`);
    if (meta && Object.keys(meta).length > 0 && level !== 'info') {
      console.log('   Metadata:', JSON.stringify(meta));
    }

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err?.message }, { status: 400 });
  }
}

export async function GET() {
  const time = new Date().toLocaleTimeString('en-US', { hour12: false });
  try {
    const [products, serials, transactions] = await Promise.all([
      db.product.count().catch(() => 0),
      db.serial.count().catch(() => 0),
      db.transaction.count().catch(() => 0),
    ]);

    const mem = Math.round(process.memoryUsage().heapUsed / 1024 / 1024);

    console.log(`\x1b[32m[NEXT HEARTBEAT ${time}]\x1b[0m App: ONLINE | DB: SQLite (Products: ${products}, Serials: ${serials}, Tx: ${transactions}) | Mem: ${mem}MB`);

    return NextResponse.json({
      status: 'healthy',
      server: 'Next.js App Server',
      timestamp: new Date().toISOString(),
      counts: { products, serials, transactions },
      memoryMb: mem,
    });
  } catch (err: any) {
    console.error(`\x1b[31m[NEXT HEARTBEAT ERR ${time}]\x1b[0m`, err?.message);
    return NextResponse.json({ status: 'degraded', error: err?.message }, { status: 500 });
  }
}
