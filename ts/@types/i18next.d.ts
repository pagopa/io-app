import Resources from "./resources";
declare module "i18next" {
  interface CustomTypeOptions {
    defaultNS: "index";
    resources: Resources;
  }
}
