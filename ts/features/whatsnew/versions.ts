import I18n from "i18n-js";
import { FastLoginWhatsNewBody } from "./screen/FastLoginWhatsNew";

// To add a new 'what's new', increase the "ACTIVE_VERSION" constant by 1
// and push a new element into the whatsNewVersions array
// TODO: this logic will be remoted. Jira ticket: IOPID-424

export const ACTIVE_VERSION = 0;

type WhatsNew = {
  version: number;
  title: string;
  body: JSX.Element;
};

export const whatsNewVersions: Array<WhatsNew> = [];

// eslint-disable-next-line functional/immutable-data
whatsNewVersions.push({
  version: 0,
  title: I18n.t("fastLogin.whatsNew.title"),
  body: FastLoginWhatsNewBody
});
