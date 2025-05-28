// @flow

// eslint-disable-next-line no-restricted-imports
import I18nJs from "i18n-js";

// eslint-disable-next-line functional/immutable-data
I18nJs.locale = "en"; // a locale from your available translations
export const getLanguages = (): Promise<Array<string>> =>
  Promise.resolve(["en"]);
export default I18nJs;
