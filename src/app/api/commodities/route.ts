import { NextRequest, NextResponse } from 'next/server';
import { getCommodities } from '@/lib/actions';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const state = searchParams.get('state') || undefined;
  const district = searchParams.get('district') || undefined;
  const market = searchParams.get('market') || undefined;

  if (!state) {
    return NextResponse.json({ success: false, error: 'Missing state' }, { status: 400 });
  }

  const res = await getCommodities({ state, district, market });
  return NextResponse.json(res);
}


