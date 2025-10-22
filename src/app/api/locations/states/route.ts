import { NextResponse } from 'next/server';
import { getStates } from '@/lib/actions';

export async function GET() {
  const res = await getStates();
  return NextResponse.json(res);
}


