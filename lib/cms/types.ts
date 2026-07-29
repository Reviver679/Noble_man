/**
 * Backend-agnostic contract for the content the admin manages.
 *
 * Everything the admin UI touches goes through TemplateStore, so swapping
 * Frappe for PocketBase means writing one new implementation of this
 * interface and pointing CMS_PROVIDER at it — no route or UI changes.
 */

export type TemplateCategory = 'Human' | 'Pets' | null;

/** A prompt template as the admin sees it (includes fields the public API hides). */
export interface AdminTemplate {
  /** Backend document id. On Frappe this equals templateName (autoname field:template_name). */
  id: string;
  templateName: string;
  promptText: string;
  /** Absolute URL when resolvable, otherwise the raw backend path. Empty when unset. */
  templateImage: string;
  category: TemplateCategory;
  isActive: boolean;
  isTopSelling: boolean;
  isStaffPick: boolean;
}

export interface TemplateInput {
  templateName: string;
  promptText: string;
  /** Value returned by uploadImage(), or '' to leave the template without a preview. */
  templateImage?: string;
  category?: TemplateCategory;
  isActive?: boolean;
  isTopSelling?: boolean;
  isStaffPick?: boolean;
}

export type TemplatePatch = Partial<Omit<TemplateInput, 'templateName'>>;

export interface UploadedImage {
  /** Store this on the template. May be backend-relative (Frappe returns /files/...). */
  value: string;
  /** Absolute URL for previewing in the admin UI. */
  url: string;
}

export interface TemplateStore {
  /** Active templates only — inactive records are retired and stay hidden from the admin. */
  list(): Promise<AdminTemplate[]>;
  get(id: string): Promise<AdminTemplate | null>;
  create(input: TemplateInput): Promise<AdminTemplate>;
  update(id: string, patch: TemplatePatch): Promise<AdminTemplate>;
  /**
   * Retire a template by flagging it inactive in the backend. Records are never
   * hard-deleted, so history and any references to them survive.
   */
  deactivate(id: string): Promise<void>;
  uploadImage(file: File): Promise<UploadedImage>;
}

/** Thrown by stores so route handlers can map backend failures onto HTTP statuses. */
export class CmsError extends Error {
  constructor(
    message: string,
    readonly status: number = 500
  ) {
    super(message);
    this.name = 'CmsError';
  }
}
