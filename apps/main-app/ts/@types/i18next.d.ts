import type it from "../../locales/it/index.json";

import { type TranslationKeys } from "../i18n";

declare module "i18next" {
  interface CustomTypeOptions {
    defaultNS: "index";
    resources: {
      index: typeof it;
    };
    returnEmptyString: false;
    returnNull: false;
  }

  interface TFunction {
    // eslint-disable-next-line @typescript-eslint/prefer-function-type
    (key: Array<TranslationKeys> | TranslationKeys, options?: any): string;
  }
}
