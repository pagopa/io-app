import { ActionType, createStandardAction } from "typesafe-actions";
import { CieLoginFlowType } from "../../features/authentication/common/analytics/cieAnalytics.ts";

export const analyticsAuthenticationStarted = createStandardAction(
  "ANALYTICS_AUTHENTICATION_STARTED"
)<CieLoginFlowType>();

export const analyticsAuthenticationCompleted = createStandardAction(
  "ANALYTICS_AUTHENTICATION_COMPLETED"
)<CieLoginFlowType>();

export type AnalyticsActions =
  | ActionType<typeof analyticsAuthenticationStarted>
  | ActionType<typeof analyticsAuthenticationCompleted>;
