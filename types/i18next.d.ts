import 'i18next';
import common from '../public/locales/en/common.json';

declare module 'i18next' {
  // Extend CustomTypeOptions
  interface CustomTypeOptions {
    // default namespace
    defaultNS: 'common';
    // strict translation keys referencing our JSON files
    resources: {
      common: typeof common;
    };
  }
}
