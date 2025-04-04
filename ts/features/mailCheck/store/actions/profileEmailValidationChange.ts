import { ActionType, createStandardAction } from "typesafe-actions";

export const profileEmailValidationChanged = createStandardAction(
  "PROFILE_EMAIL_VALIDATION_CHANGED"
)<boolean>();

export type ProfileEmailValidationAction = ActionType<
  typeof profileEmailValidationChanged
>;
