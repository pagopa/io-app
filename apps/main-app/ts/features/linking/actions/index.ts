import { ActionType, createStandardAction } from "typesafe-actions";

export const storeLinkingUrl =
  createStandardAction("STORE_LINKING_URL")<string>();
export const clearLinkingUrl = createStandardAction("CLEAR_LINKING_URL")();

export type BackgroundLinkingActions = ActionType<
  typeof storeLinkingUrl | typeof clearLinkingUrl
>;
