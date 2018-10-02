import { ActionType, createAction } from "typesafe-actions";

export const analyticsAuthenticationStarted = createAction(
  "ANALYTICS_AUTHENTICATION_STARTED"
);

export const analyticsAuthenticationCompleted = createAction(
  "ANALYTICS_AUTHENTICATION_COMPLETED"
);

export const analyticsOnboardingStarted = createAction(
  "ANALYTICS_ONBOARDING_STARTED"
);

export type AnalyticsActions =
  | ActionType<typeof analyticsOnboardingStarted>
  | ActionType<typeof analyticsAuthenticationStarted>
  | ActionType<typeof analyticsAuthenticationCompleted>;
