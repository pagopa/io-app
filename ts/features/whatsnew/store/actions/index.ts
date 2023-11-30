import { ActionType, createStandardAction } from "typesafe-actions";

type DisableWhatsNewPayload = {
  whatsNewVersion: number;
};

export const disableWhatsNew =
  createStandardAction("DISABLE_WHATS_NEW")<DisableWhatsNewPayload>();

type WhatsNewActionsType = typeof disableWhatsNew;

export type WhatsNewActions = ActionType<WhatsNewActionsType>;
