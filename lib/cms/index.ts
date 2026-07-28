import 'server-only';

import { frappeTemplateStore } from './frappe';
import type { TemplateStore } from './types';

export * from './types';

/**
 * Resolve the configured content backend.
 *
 * To move to PocketBase: add lib/cms/pocketbase.ts exporting a TemplateStore,
 * register it here, and set CMS_PROVIDER=pocketbase. Nothing else changes.
 */
export function getTemplateStore(): TemplateStore {
  const provider = (process.env.CMS_PROVIDER || 'frappe').toLowerCase();
  switch (provider) {
    case 'frappe':
      return frappeTemplateStore;
    default:
      throw new Error(
        `Unknown CMS_PROVIDER "${provider}". Supported providers: frappe.`
      );
  }
}
