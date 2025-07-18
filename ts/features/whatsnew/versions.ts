// To add a new 'what's new', increase the "ACTIVE_VERSION" constant by 1
// and push a new element into the whatsNewVersions array
// TODO: this logic will be remoted. Jira ticket: IOPID-424

import { JSX } from "react";

export const ACTIVE_VERSION = 0;

type WhatsNew = {
  version: number;
  title: string;
  body: JSX.Element;
};

export const whatsNewVersions: Array<WhatsNew> = [];
