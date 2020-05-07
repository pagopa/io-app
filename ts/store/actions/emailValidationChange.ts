import { ActionType, createStandardAction } from "typesafe-actions";

export const emailValidationChanged = createStandardAction(
  "EMAIL_VALIDATION_CHANGED"
)<boolean>();

export type EmailValidationAction = ActionType<typeof emailValidationChanged>;
