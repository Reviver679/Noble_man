import 'server-only';

import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { ADMIN_COOKIE, verifySessionToken } from './session';
import { CmsError } from '@/lib/cms/types';

/** Returns a 401 response when the caller has no valid admin session, else null. */
export async function requireAdmin(): Promise<NextResponse | null> {
  const store = await cookies();
  const ok = await verifySessionToken(store.get(ADMIN_COOKIE)?.value);
  if (ok) return null;
  return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
}

/** Maps thrown errors onto a JSON response, keeping CmsError's status. */
export function errorResponse(error: unknown): NextResponse {
  if (error instanceof CmsError) {
    return NextResponse.json({ error: error.message }, { status: error.status });
  }
  const message = error instanceof Error ? error.message : 'Unexpected error';
  console.error('[admin]', error);
  return NextResponse.json({ error: message }, { status: 500 });
}
