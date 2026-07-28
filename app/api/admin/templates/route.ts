import { NextRequest, NextResponse } from 'next/server';
import { getTemplateStore, type TemplateCategory, type TemplateInput } from '@/lib/cms';
import { errorResponse, requireAdmin } from '@/lib/admin/guard';

function parseCategory(value: unknown): TemplateCategory {
  return value === 'Human' || value === 'Pets' ? value : null;
}

export async function GET() {
  const denied = await requireAdmin();
  if (denied) return denied;

  try {
    const templates = await getTemplateStore().list();
    return NextResponse.json({ templates });
  } catch (error) {
    return errorResponse(error);
  }
}

export async function POST(req: NextRequest) {
  const denied = await requireAdmin();
  if (denied) return denied;

  try {
    const body = await req.json();
    const templateName = typeof body.templateName === 'string' ? body.templateName.trim() : '';
    const promptText = typeof body.promptText === 'string' ? body.promptText.trim() : '';

    if (!templateName) {
      return NextResponse.json({ error: 'Template name is required' }, { status: 400 });
    }
    if (!promptText) {
      return NextResponse.json({ error: 'Prompt text is required' }, { status: 400 });
    }

    const input: TemplateInput = {
      templateName,
      promptText,
      templateImage: typeof body.templateImage === 'string' ? body.templateImage : '',
      category: parseCategory(body.category),
      isActive: body.isActive !== false,
      isTopSelling: body.isTopSelling === true,
      isStaffPick: body.isStaffPick === true,
    };

    const template = await getTemplateStore().create(input);
    return NextResponse.json({ template }, { status: 201 });
  } catch (error) {
    return errorResponse(error);
  }
}
