import type { PostProcessorModule } from "i18next";

/**
 * Module-level flag controlling whether translation keys are shown in place of
 * translated strings. Kept outside React/Redux so it can be read synchronously
 * inside the i18next post-processor on every render cycle.
 *
 * Wrapped in a `const` object to satisfy the `functional/no-let` lint rule;
 * mutation is intentional and scoped to `setI18nDebugMode`.
 */
const state = { isEnabled: false };

/**
 * Syncs the post-processor flag with the Redux-persisted preference.
 * Called by `useI18nDebugSync` whenever the Redux state changes.
 */
export const setI18nDebugMode = (enabled: boolean) => {
  // eslint-disable-next-line functional/immutable-data
  state.isEnabled = enabled;
};

/**
 * i18next post-processor that, when enabled, replaces every translated string
 * with its translation key wrapped in square brackets (e.g. `[global.ok]`).
 *
 * This lets the content team identify which i18n key maps to which UI label
 * without modifying a single component.
 *
 * Registration: `i18next.use(i18nDebugPostProcessor).init({ postProcess: ["i18nDebug"], … })`
 */
export const i18nDebugPostProcessor: PostProcessorModule = {
  type: "postProcessor",
  name: "i18nDebug",
  process(value: string, key: Array<string> | string): string {
    if (!state.isEnabled) {
      return value;
    }
    const keyStr = Array.isArray(key) ? key.join(", ") : key;
    return `[${keyStr}]`;
  }
};
