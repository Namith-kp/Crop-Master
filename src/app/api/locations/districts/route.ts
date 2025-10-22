import { NextRequest, NextResponse } from 'next/server';
 import { getDistrictsByState } from '@/lib/actions'; 
 
 export async function GET(req: NextRequest) { 
  const { searchParams } = new URL(req.url);
   const state = searchParams.get('state') || ''; 
   
   if (!state) {
     return NextResponse.json({ success: false, error: 'Missing state' }, { status: 400 }); 
  } 
  
  const res = await getDistrictsByState(state); return NextResponse.json(res);
 }