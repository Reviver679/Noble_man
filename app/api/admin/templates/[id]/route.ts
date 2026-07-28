import { NextRequest, NextResponse } from 'next/server';
import { getTemplateStore, type TemplateCategory, type TemplatePatch } from '@/lib/cms';
import { errorResponse, requireAdmin } from '@/lib/admin/guard';

type RouteContext = { params: Promise<{ id: string }> };

function parseCategory(value: unknown): TemplateCategory {
  return value === 'Human' || value === 'Pets' ? value : null;
}

export async function PATCH(req: NextRequest, { params }: RouteContext) {
  const denied = await requireAdmin();
  if (denied) return denied;

  try {
    const { id } = await params;
    const body = await req.json();
    const patch: TemplatePatch = {};

    if (typeof body.promptText === 'string') {
      const promptText = body.promptText.trim();
      if (!promptText) {
        return NextResponse.json({ error: 'Prompt text cannot be empty' }, { status: 400 });
      }
      patch.promptText = promptText;
    }
    if (typeof body.templateImage === 'string') patch.templateImage = body.templateImage;
    if ('category' in body) patch.category = parseCategory(body.category);
    if (typeof body.isActive === 'boolean') patch.isActive = body.isActive;
    if (typeof body.isTopSelling === 'boolean') patch.isTopSelling = body.isTopSelling;
    if (typeof body.isStaffPick === 'boolean') patch.isStaffPick = body.isStaffPick;

    if (Object.keys(patch).length === 0) {
      return NextResponse.json({ error: 'Nothing to update' }, { status: 400 });
    }

    const template = await getTemplateStore().update(id, patch);
    return NextResponse.json({ template });
  } catch (error) {
    return errorResponse(error);
  }
}

export async function DELETE(_req: NextRequest, { params }: RouteContext) {
  const denied = await requireAdmin();
  if (denied) return denied;

  try {
    const { id } = await params;
    await getTemplateStore().remove(id);
    return NextResponse.json({ ok: true });
  } catch (error) {
    return errorResponse(error);
  }
}
