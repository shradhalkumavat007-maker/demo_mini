import { NextResponse } from 'next/server';
import { demoAccounts } from '@/data/mock-users';

export async function GET() {
  const admin = demoAccounts[0];
  return NextResponse.json({
    id: admin.id,
    name: admin.name,
    email: admin.email,
    role: admin.role,
    status: 'active',
  });
}
