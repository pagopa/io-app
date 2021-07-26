import { ActionType, createAction } from "typesafe-actions";

export const analyticsAuthenticationStarted = createAction(
  "ANALYTICS_AUTHENTICATION_STARTED"
);

export const analyticsAuthenticationCompleted = createAction(
  "ANALYTICS_AUTHENTICATION_COMPLETED"
);

export type AnalyticsActions =
  | ActionType<typeof analyticsAuthenticationStarted>
  | ActionType<typeof analyticsAuthenticationCompleted>;
