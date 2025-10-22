import { NextRequest, NextResponse } from 'next/server';
import { getMarkets } from '@/lib/actions';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const state = searchParams.get('state') || '';
  const district = searchParams.get('district') || '';
  if (!state) {
    return NextResponse.json({ success: false, error: 'Missing state' }, { status: 400 });
  }
  const res = await getMarkets(state, district);
  return NextResponse.json(res);
}


