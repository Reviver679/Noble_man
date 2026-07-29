'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import { AlertCircle, LogOut, Pencil, Plus, RefreshCw, Trash2, X } from 'lucide-react';
import type { AdminTemplate } from '@/lib/cms/types';
import TemplateForm, {
  emptyForm,
  formFromTemplate,
  type TemplateFormValues,
} from '@/components/admin/TemplateForm';

export default function AdminPage() {
  const router = useRouter();
  const [templates, setTemplates] = useState<AdminTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [editorOpen, setEditorOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<TemplateFormValues>(emptyForm());
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const res = await fetch('/api/admin/templates', { cache: 'no-store' });
      if (res.status === 401) {
        router.replace('/admin/login');
        return;
      }
      const data = await res.json();
      if (!res.ok) {
        setLoadError(data.error || 'Failed to load templates');
        return;
      }
      setTemplates(data.templates);
    } catch {
      setLoadError('Could not reach the server.');
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    load();
  }, [load]);

  const openCreate = () => {
    setEditingId(null);
    setForm(emptyForm());
    setSaveError(null);
    setEditorOpen(true);
  };

  const openEdit = (t: AdminTemplate) => {
    setEditingId(t.id);
    setForm(formFromTemplate(t));
    setSaveError(null);
    setEditorOpen(true);
  };

  const save = async () => {
    setSaving(true);
    setSaveError(null);
    try {
      const payload: Record<string, unknown> = {
        promptText: form.promptText,
        category: form.category,
        isTopSelling: form.isTopSelling,
        isStaffPick: form.isStaffPick,
      };
      // Only send the image when a new one was uploaded, so editing without
      // touching the picker doesn't clear the existing preview.
      if (form.templateImage) payload.templateImage = form.templateImage;
      else if (!form.imagePreview) payload.templateImage = '';

      const res = editingId
        ? await fetch(`/api/admin/templates/${encodeURIComponent(editingId)}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
          })
        : await fetch('/api/admin/templates', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ...payload, templateName: form.templateName }),
          });

      const data = await res.json();
      if (!res.ok) {
        setSaveError(data.error || 'Save failed');
        return;
      }
      setEditorOpen(false);
      await load();
    } catch {
      setSaveError('Could not reach the server.');
    } finally {
      setSaving(false);
    }
  };

  const remove = async (t: AdminTemplate) => {
    const ok = window.confirm(
      `Delete “${t.templateName}”? It will be marked inactive in the backend and disappear from this list.`
    );
    if (!ok) return;
    setDeletingId(t.id);
    try {
      const res = await fetch(`/api/admin/templates/${encodeURIComponent(t.id)}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (!res.ok) {
        setLoadError(data.error || 'Delete failed');
        return;
      }
      await load();
    } catch {
      setLoadError('Could not reach the server.');
    } finally {
      setDeletingId(null);
    }
  };

  const logout = async () => {
    await fetch('/api/admin/logout', { method: 'POST' });
    router.replace('/admin/login');
    router.refresh();
  };

  return (
    <div className="min-h-screen">
      <header className="border-b border-border">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-5 sm:px-6 lg:px-8">
          <div>
            <span className="font-serif text-2xl text-foreground">Nobilified</span>
            <span className="eyebrow ml-3">Admin</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={load}
              className="flex items-center gap-2 rounded-full border border-border px-4 py-2 text-xs font-medium text-foreground transition-colors hover:bg-secondary"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              Refresh
            </button>
            <button
              onClick={logout}
              className="flex items-center gap-2 rounded-full border border-border px-4 py-2 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              <LogOut className="h-3.5 w-3.5" />
              Sign out
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h1 className="font-serif text-3xl text-foreground md:text-4xl">Prompt templates</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {loading ? 'Loading…' : `${templates.length} template${templates.length === 1 ? '' : 's'}`}
            </p>
          </div>
          <button
            onClick={openCreate}
            className="flex shrink-0 items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-transform hover:scale-[1.02]"
          >
            <Plus className="h-4 w-4" />
            New template
          </button>
        </div>

        {loadError && (
          <div className="mt-6 flex items-start gap-3 rounded-lg border border-destructive/40 bg-destructive/10 p-4">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-destructive" />
            <p className="text-sm text-destructive">{loadError}</p>
          </div>
        )}

        {loading ? (
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-40 animate-pulse rounded-xl bg-muted" />
            ))}
          </div>
        ) : templates.length === 0 && !loadError ? (
          <div className="mt-16 text-center">
            <p className="text-sm text-muted-foreground">
              No templates yet. Create your first one to see it on the site.
            </p>
          </div>
        ) : (
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {templates.map((t) => (
              <div
                key={t.id}
                className="flex gap-4 rounded-xl border border-border bg-card/60 p-4 transition-colors hover:border-foreground/25"
              >
                <div className="h-28 w-20 shrink-0 overflow-hidden rounded-lg border border-border bg-muted">
                  {t.templateImage ? (
                    <img src={t.templateImage} alt="" className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-[10px] text-muted-foreground">
                      No image
                    </div>
                  )}
                </div>

                <div className="flex min-w-0 flex-1 flex-col">
                  <h2 className="truncate font-serif text-lg text-foreground">{t.templateName}</h2>
                  <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-muted-foreground">
                    {t.promptText || 'No prompt text'}
                  </p>

                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {t.category && <Badge>{t.category}</Badge>}
                    {t.isTopSelling && <Badge>Top selling</Badge>}
                    {t.isStaffPick && <Badge>Staff pick</Badge>}
                  </div>

                  <div className="mt-auto flex gap-2 pt-3">
                    <button
                      onClick={() => openEdit(t)}
                      className="flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-xs text-foreground transition-colors hover:bg-secondary"
                    >
                      <Pencil className="h-3 w-3" />
                      Edit
                    </button>
                    <button
                      onClick={() => remove(t)}
                      disabled={deletingId === t.id}
                      className="flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:border-destructive/50 hover:text-destructive disabled:opacity-50"
                    >
                      <Trash2 className="h-3 w-3" />
                      {deletingId === t.id ? 'Deleting…' : 'Delete'}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Editor drawer */}
      <AnimatePresence>
        {editorOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm"
            onClick={() => !saving && setEditorOpen(false)}
          >
            <motion.div
              initial={{ x: 40, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: 40, opacity: 0 }}
              transition={{ duration: 0.25 }}
              onClick={(e) => e.stopPropagation()}
              className="h-full w-full max-w-lg overflow-y-auto border-l border-border bg-background p-6"
            >
              <div className="mb-6 flex items-center justify-between">
                <h2 className="font-serif text-2xl text-foreground">
                  {editingId ? 'Edit template' : 'New template'}
                </h2>
                <button
                  onClick={() => !saving && setEditorOpen(false)}
                  className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <TemplateForm
                values={form}
                onChange={setForm}
                isEditing={Boolean(editingId)}
                onSubmit={save}
                onCancel={() => setEditorOpen(false)}
                saving={saving}
                error={saveError}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function Badge({ children }: { children: React.ReactNode }) {
  return (
    <span className="rounded-full border border-border px-2 py-0.5 text-[10px] uppercase tracking-wider text-muted-foreground">
      {children}
    </span>
  );
}
