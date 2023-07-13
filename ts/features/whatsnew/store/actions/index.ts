import { ActionType, createStandardAction } from "typesafe-actions";

type DisableWhatsNewPayload = {
  whatsNewVersion: number;
};

export const disableWhatsNew =
  createStandardAction("DISABLE_WHATS_NEW")<DisableWhatsNewPayload>();

export const enableWhatsNewCheck = createStandardAction(
  "ENABLE_WHATS_NEW_CHECK"
)();

export const whatsNewDisplayed = createStandardAction("WHATS_NEW_DISPLAYED")();

type WhatsNewActionsType =
  | typeof disableWhatsNew
  | typeof enableWhatsNewCheck
  | typeof whatsNewDisplayed;

export type WhatsNewActions = ActionType<WhatsNewActionsType>;
