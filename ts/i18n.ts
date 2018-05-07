import I18n from "react-native-i18n";

// Import all locales
const en = require("../locales/en.json");
const it = require("../locales/it.json");

// Should the app fallback to English if user locale doesn't exists
// tslint:disable-next-line:no-object-mutation
I18n.fallbacks = true;

// Define the supported translations
// tslint:disable-next-line:no-object-mutation
I18n.translations = {
  en,
  it
};

export default I18n;
