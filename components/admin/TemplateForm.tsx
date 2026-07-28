'use client';

import { useRef, useState } from 'react';
import { ImagePlus, Loader2, X } from 'lucide-react';
import type { AdminTemplate, TemplateCategory } from '@/lib/cms/types';

export interface TemplateFormValues {
  templateName: string;
  promptText: string;
  templateImage: string;
  imagePreview: string;
  category: TemplateCategory;
  isActive: boolean;
  isTopSelling: boolean;
  isStaffPick: boolean;
}

export function emptyForm(): TemplateFormValues {
  return {
    templateName: '',
    promptText: '',
    templateImage: '',
    imagePreview: '',
    category: null,
    isActive: true,
    isTopSelling: false,
    isStaffPick: false,
  };
}

export function formFromTemplate(t: AdminTemplate): TemplateFormValues {
  return {
    templateName: t.templateName,
    promptText: t.promptText,
    // The stored value is backend-relative; the list gives us the absolute URL for preview.
    templateImage: '',
    imagePreview: t.templateImage,
    category: t.category,
    isActive: t.isActive,
    isTopSelling: t.isTopSelling,
    isStaffPick: t.isStaffPick,
  };
}

const CATEGORIES: { value: TemplateCategory; label: string }[] = [
  { value: null, label: 'Uncategorised' },
  { value: 'Human', label: 'Human' },
  { value: 'Pets', label: 'Pets' },
];

interface Props {
  values: TemplateFormValues;
  onChange: (values: TemplateFormValues) => void;
  /** Editing an existing template — the name is the backend document id and can't change here. */
  isEditing: boolean;
  onSubmit: () => void;
  onCancel: () => void;
  saving: boolean;
  error: string | null;
}

export default function TemplateForm({
  values,
  onChange,
  isEditing,
  onSubmit,
  onCancel,
  saving,
  error,
}: Props) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const set = <K extends keyof TemplateFormValues>(key: K, value: TemplateFormValues[K]) =>
    onChange({ ...values, [key]: value });

  const handleFile = async (file: File) => {
    setUploading(true);
    setUploadError(null);
    try {
      const body = new FormData();
      body.append('file', file);
      const res = await fetch('/api/admin/upload', { method: 'POST', body });
      const data = await res.json();
      if (!res.ok) {
        setUploadError(data.error || 'Upload failed');
        return;
      }
      onChange({ ...values, templateImage: data.value, imagePreview: data.url });
    } catch {
      setUploadError('Upload failed. Check your connection.');
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  const canSubmit = values.templateName.trim() && values.promptText.trim() && !saving && !uploading;

  return (
    <div className="space-y-5">
      <div className="space-y-2">
        <label className="eyebrow block">Template name</label>
        <input
          value={values.templateName}
          onChange={(e) => set('templateName', e.target.value)}
          disabled={isEditing}
          placeholder="e.g. Renaissance Noble"
          className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-60"
        />
        {isEditing && (
          <p className="text-xs text-muted-foreground">
            The name is the record&rsquo;s id in the backend, so it can&rsquo;t be changed after
            creation. Create a new template to rename.
          </p>
        )}
      </div>

      <div className="space-y-2">
        <label className="eyebrow block">Prompt text</label>
        <textarea
          value={values.promptText}
          onChange={(e) => set('promptText', e.target.value)}
          rows={7}
          placeholder="The prompt sent to the image model…"
          className="w-full resize-y rounded-lg border border-border bg-background px-4 py-3 font-mono text-xs leading-relaxed text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
        />
        <p className="text-xs text-muted-foreground">
          Never shown to customers — the public API returns only the name and preview image.
        </p>
      </div>

      <div className="space-y-2">
        <label className="eyebrow block">Preview image</label>
        <div className="flex items-start gap-4">
          <div className="relative h-32 w-24 shrink-0 overflow-hidden rounded-lg border border-border bg-muted">
            {values.imagePreview ? (
              <img src={values.imagePreview} alt="" className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-[10px] text-muted-foreground">
                No image
              </div>
            )}
            {uploading && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/60">
                <Loader2 className="h-5 w-5 animate-spin text-white" />
              </div>
            )}
          </div>

          <div className="space-y-2">
            <input
              ref={fileRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
              className="hidden"
            />
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              disabled={uploading}
              className="flex items-center gap-2 rounded-full border border-border px-4 py-2 text-xs font-medium text-foreground transition-colors hover:bg-secondary disabled:opacity-50"
            >
              <ImagePlus className="h-3.5 w-3.5" />
              {values.imagePreview ? 'Replace image' : 'Upload image'}
            </button>
            {values.imagePreview && (
              <button
                type="button"
                onClick={() => onChange({ ...values, templateImage: '', imagePreview: '' })}
                className="flex items-center gap-1.5 text-xs text-muted-foreground transition-colors hover:text-destructive"
              >
                <X className="h-3 w-3" />
                Remove
              </button>
            )}
            <p className="text-xs text-muted-foreground">JPG, PNG or WebP · max 10MB</p>
            {uploadError && <p className="text-xs text-destructive">{uploadError}</p>}
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <label className="eyebrow block">Category</label>
        <div className="flex gap-2">
          {CATEGORIES.map((c) => {
            const active = values.category === c.value;
            return (
              <button
                key={c.label}
                type="button"
                onClick={() => set('category', c.value)}
                className={`rounded-full px-4 py-1.5 text-xs font-medium transition-colors ${
                  active
                    ? 'bg-primary text-primary-foreground'
                    : 'border border-border text-muted-foreground hover:text-foreground'
                }`}
              >
                {c.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="space-y-2.5">
        {(
          [
            ['isActive', 'Active — visible on the site'],
            ['isTopSelling', 'Show in Top Selling'],
            ['isStaffPick', 'Show in Staff Picks'],
          ] as const
        ).map(([key, label]) => (
          <label key={key} className="flex cursor-pointer items-center gap-3 text-sm text-foreground">
            <input
              type="checkbox"
              checked={values[key]}
              onChange={(e) => set(key, e.target.checked)}
              className="h-4 w-4 accent-white"
            />
            {label}
          </label>
        ))}
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <div className="flex gap-3 pt-2">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 rounded-full border border-border py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-secondary"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={onSubmit}
          disabled={!canSubmit}
          className="flex flex-1 items-center justify-center gap-2 rounded-full bg-primary py-2.5 text-sm font-semibold text-primary-foreground disabled:opacity-50"
        >
          {saving && <Loader2 className="h-4 w-4 animate-spin" />}
          {isEditing ? 'Save changes' : 'Create template'}
        </button>
      </div>
    </div>
  );
}
