import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

// POST /api/warranties/:id/claims — add a warranty claim
export async function POST(req: Request, { params }: { params: { id: string } }) {
  const body = await req.json();
  try {
    const claim = await db.warrantyClaim.create({
      data: {
        id: `wc-${Date.now()}`,
        warrantyId: params.id,
        date: new Date(),
        issueDescription: body.issueDescription,
        status: body.status ?? 'pending',
        resolutionNotes: body.resolutionNotes ?? null,
      },
    });
    return NextResponse.json(claim, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Failed to create claim' }, { status: 400 });
  }
}
