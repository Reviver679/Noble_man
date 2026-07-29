import { NextRequest, NextResponse } from 'next/server';
import { getTemplateStore } from '@/lib/cms';
import { errorResponse, requireAdmin } from '@/lib/admin/guard';

const MAX_BYTES = 10 * 1024 * 1024;
const ALLOWED = ['image/jpeg', 'image/png', 'image/webp'];

export async function POST(req: NextRequest) {
  const denied = await requireAdmin();
  if (denied) return denied;

  try {
    const form = await req.formData();
    const file = form.get('file');

    if (!(file instanceof File)) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }
    if (!ALLOWED.includes(file.type)) {
      return NextResponse.json({ error: 'Image must be JPG, PNG, or WebP' }, { status: 400 });
    }
    if (file.size > MAX_BYTES) {
      return NextResponse.json({ error: 'Image must be smaller than 10MB' }, { status: 400 });
    }

    const uploaded = await getTemplateStore().uploadImage(file);
    return NextResponse.json(uploaded);
  } catch (error) {
    return errorResponse(error);
  }
}
