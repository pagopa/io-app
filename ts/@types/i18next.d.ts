import itJson from "../../locales/it/index.json";

declare module "i18next" {
  interface CustomTypeOptions {
    resources: {
      translation: typeof itJson;
    };
  }
}
