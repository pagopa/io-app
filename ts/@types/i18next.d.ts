import index from "../../locales/it/index.json";

const resources = {
  index
} as const;

declare module "i18next" {
  interface CustomTypeOptions {
    defaultNS: "index";
    resources: typeof resources;
  }
}
