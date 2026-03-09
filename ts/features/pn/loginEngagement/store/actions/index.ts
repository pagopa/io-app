import { ActionType, createAction } from "typesafe-actions";

export const setSendEngagementScreenHasBeenDismissed = createAction(
  "SET_SEND_ENGAGEMENT_SCREEN_HAS_BEEN_DISMISSED"
);

export type SENDLoginEngagementActions = ActionType<
  typeof setSendEngagementScreenHasBeenDismissed
>;
