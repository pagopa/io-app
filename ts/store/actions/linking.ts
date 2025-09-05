import { ActionType, createStandardAction } from "typesafe-actions";

export const storeLinkingUrl =
  createStandardAction("STORE_LINKING_URL")<string>();

export type LinkingActions = ActionType<typeof storeLinkingUrl>;
