import { NextResponse } from 'next/server';
import { demoAccounts } from '@/data/mock-users';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const email = (body.email || '').trim().toLowerCase();
    const password = body.password || '';

    const account = demoAccounts.find(
      (a) => a.email.toLowerCase() === email && (!password || a.password === password)
    );

    if (account) {
      const user = {
        id: account.id,
        name: account.name,
        email: account.email,
        role: account.role,
        status: 'active',
        lastLogin: new Date().toISOString(),
      };
      return NextResponse.json({
        success: true,
        user,
        token: `jwt-token-${Date.now()}`,
      });
    }

    return NextResponse.json(
      { success: false, error: 'Invalid email or password' },
      { status: 401 }
    );
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err?.message }, { status: 500 });
  }
}
