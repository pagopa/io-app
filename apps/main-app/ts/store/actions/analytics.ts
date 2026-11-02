import { ActionType, createStandardAction } from "typesafe-actions";

import { LoginType } from "../../features/authentication/common/utils/index";

export const analyticsAuthenticationStarted = createStandardAction(
  "ANALYTICS_AUTHENTICATION_STARTED"
)<LoginType>();

export const analyticsAuthenticationCompleted = createStandardAction(
  "ANALYTICS_AUTHENTICATION_COMPLETED"
)<LoginType>();

export type AnalyticsActions =
  | ActionType<typeof analyticsAuthenticationCompleted>
  | ActionType<typeof analyticsAuthenticationStarted>;
