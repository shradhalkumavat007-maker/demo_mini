import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const res = await fetch('http://localhost:8085/api/oracle/status', { cache: 'no-store' });
    if (res.ok) {
      const data = await res.json();
      return NextResponse.json({
        ok: true,
        source: 'Java REST Backend + Oracle Database XE',
        ...data,
      });
    }
  } catch (err: any) {
    return NextResponse.json(
      {
        ok: false,
        source: 'Java Backend Unreachable',
        error: err?.message || 'Connection refused',
      },
      { status: 502 }
    );
  }

  return NextResponse.json({ ok: false, message: 'Could not fetch Oracle status' }, { status: 500 });
}
