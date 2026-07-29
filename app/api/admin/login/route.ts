import { NextRequest, NextResponse } from 'next/server';
import {
  ADMIN_COOKIE,
  SESSION_TTL_SECONDS,
  createSessionToken,
  verifyAdminPassword,
} from '@/lib/admin/session';

export async function POST(req: NextRequest) {
  try {
    const { password } = await req.json();
    if (typeof password !== 'string' || !password) {
      return NextResponse.json({ error: 'Password is required' }, { status: 400 });
    }

    if (!(await verifyAdminPassword(password))) {
      return NextResponse.json({ error: 'Incorrect password' }, { status: 401 });
    }

    const res = NextResponse.json({ ok: true });
    res.cookies.set(ADMIN_COOKIE, await createSessionToken(), {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      maxAge: SESSION_TTL_SECONDS,
    });
    return res;
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Login failed';
    console.error('[admin] login failed:', error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
