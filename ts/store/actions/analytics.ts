import { ActionType, createStandardAction } from "typesafe-actions";
import { LoginType } from "../../features/authentication/activeSessionLogin/screens/analytics";

export const analyticsAuthenticationStarted = createStandardAction(
  "ANALYTICS_AUTHENTICATION_STARTED"
)<LoginType>();

export const analyticsAuthenticationCompleted = createStandardAction(
  "ANALYTICS_AUTHENTICATION_COMPLETED"
)<LoginType>();

export type AnalyticsActions =
  | ActionType<typeof analyticsAuthenticationStarted>
  | ActionType<typeof analyticsAuthenticationCompleted>;
