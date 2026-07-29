import 'server-only';

import {
  AdminTemplate,
  CmsError,
  TemplateCategory,
  TemplateInput,
  TemplatePatch,
  TemplateStore,
  UploadedImage,
} from './types';

const DOCTYPE = 'Prompt Template';

interface FrappeDoc {
  name: string;
  template_name?: string;
  prompt_text?: string;
  template_image?: string | null;
  category?: string | null;
  is_active?: number;
  is_top_selling?: number;
  is_staff_pick?: number;
}

function backendUrl(): string {
  return (process.env.NEXT_PUBLIC_BACKEND_URL || 'https://api.nobilified.com').replace(/\/$/, '');
}

function authHeader(): string {
  const key = process.env.FRAPPE_API_KEY;
  const secret = process.env.FRAPPE_API_SECRET;
  if (!key || !secret) {
    throw new CmsError(
      'FRAPPE_API_KEY / FRAPPE_API_SECRET are not set. Generate an API key for a System Manager user in Frappe and add both to .env.local.',
      500
    );
  }
  return `token ${key}:${secret}`;
}

/** Frappe reports errors in several shapes; pull out the most useful string. */
async function readError(res: Response, fallback: string): Promise<string> {
  const raw = await res.text();
  try {
    const json = JSON.parse(raw);
    if (json._server_messages) {
      try {
        const parsed = JSON.parse(json._server_messages);
        const first = Array.isArray(parsed) ? parsed[0] : parsed;
        const inner = typeof first === 'string' ? JSON.parse(first) : first;
        return inner?.message || String(first);
      } catch {
        return String(json._server_messages);
      }
    }
    if (json.exception) return String(json.exception);
    if (json.message) return typeof json.message === 'string' ? json.message : JSON.stringify(json.message);
  } catch {
    /* not JSON — fall through to the raw body */
  }
  return raw ? `${fallback}: ${raw.slice(0, 300)}` : fallback;
}

function toAbsolute(fileUrl?: string | null): string {
  if (!fileUrl) return '';
  if (/^https?:\/\//i.test(fileUrl)) return fileUrl;
  return `${backendUrl()}${fileUrl.startsWith('/') ? '' : '/'}${fileUrl}`;
}

function toAdminTemplate(doc: FrappeDoc): AdminTemplate {
  const category = doc.category === 'Human' || doc.category === 'Pets' ? doc.category : null;
  return {
    id: doc.name,
    templateName: doc.template_name || doc.name,
    promptText: doc.prompt_text || '',
    templateImage: toAbsolute(doc.template_image),
    category: category as TemplateCategory,
    isActive: Boolean(doc.is_active),
    isTopSelling: Boolean(doc.is_top_selling),
    isStaffPick: Boolean(doc.is_staff_pick),
  };
}

function toFrappeFields(input: TemplateInput | TemplatePatch): Record<string, unknown> {
  const body: Record<string, unknown> = {};
  if ('templateName' in input && input.templateName !== undefined) body.template_name = input.templateName;
  if (input.promptText !== undefined) body.prompt_text = input.promptText;
  if (input.templateImage !== undefined) body.template_image = input.templateImage || null;
  if (input.category !== undefined) body.category = input.category ?? '';
  if (input.isActive !== undefined) body.is_active = input.isActive ? 1 : 0;
  if (input.isTopSelling !== undefined) body.is_top_selling = input.isTopSelling ? 1 : 0;
  if (input.isStaffPick !== undefined) body.is_staff_pick = input.isStaffPick ? 1 : 0;
  return body;
}

async function request(path: string, init: RequestInit = {}): Promise<Response> {
  const res = await fetch(`${backendUrl()}${path}`, {
    ...init,
    cache: 'no-store',
    headers: {
      Authorization: authHeader(),
      Accept: 'application/json',
      ...(init.headers || {}),
    },
  });
  return res;
}

export const frappeTemplateStore: TemplateStore = {
  async list() {
    const fields = encodeURIComponent(
      JSON.stringify([
        'name',
        'template_name',
        'prompt_text',
        'template_image',
        'category',
        'is_active',
        'is_top_selling',
        'is_staff_pick',
      ])
    );
    // Inactive templates are retired — the admin never lists them.
    const filters = encodeURIComponent(JSON.stringify([['is_active', '=', 1]]));
    const res = await request(
      `/api/resource/${encodeURIComponent(DOCTYPE)}?fields=${fields}&filters=${filters}&limit_page_length=0&order_by=creation%20desc`
    );
    if (!res.ok) {
      throw new CmsError(await readError(res, 'Failed to load templates'), res.status);
    }
    const json = await res.json();
    const docs: FrappeDoc[] = json?.data ?? [];
    return docs.map(toAdminTemplate);
  },

  async get(id) {
    const res = await request(`/api/resource/${encodeURIComponent(DOCTYPE)}/${encodeURIComponent(id)}`);
    if (res.status === 404) return null;
    if (!res.ok) {
      throw new CmsError(await readError(res, 'Failed to load template'), res.status);
    }
    const json = await res.json();
    return json?.data ? toAdminTemplate(json.data) : null;
  },

  async create(input) {
    const res = await request(`/api/resource/${encodeURIComponent(DOCTYPE)}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(toFrappeFields(input)),
    });
    if (!res.ok) {
      throw new CmsError(await readError(res, 'Failed to create template'), res.status);
    }
    const json = await res.json();
    return toAdminTemplate(json.data);
  },

  async update(id, patch) {
    const res = await request(`/api/resource/${encodeURIComponent(DOCTYPE)}/${encodeURIComponent(id)}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(toFrappeFields(patch)),
    });
    if (!res.ok) {
      throw new CmsError(await readError(res, 'Failed to update template'), res.status);
    }
    const json = await res.json();
    return toAdminTemplate(json.data);
  },

  async deactivate(id) {
    const res = await request(`/api/resource/${encodeURIComponent(DOCTYPE)}/${encodeURIComponent(id)}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ is_active: 0 }),
    });
    if (!res.ok) {
      throw new CmsError(await readError(res, 'Failed to remove template'), res.status);
    }
  },

  async uploadImage(file) {
    const form = new FormData();
    form.append('file', file, file.name);
    // Preview images are shown on the public site, so they must not be private.
    form.append('is_private', '0');
    form.append('doctype', DOCTYPE);

    const res = await request('/api/method/upload_file', { method: 'POST', body: form });
    if (!res.ok) {
      throw new CmsError(await readError(res, 'Failed to upload image'), res.status);
    }
    const json = await res.json();
    const fileUrl: string | undefined = json?.message?.file_url;
    if (!fileUrl) {
      throw new CmsError('Upload succeeded but the backend returned no file URL', 502);
    }
    return { value: fileUrl, url: toAbsolute(fileUrl) };
  },
};
