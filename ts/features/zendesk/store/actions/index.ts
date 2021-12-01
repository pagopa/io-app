import { ActionType, createStandardAction } from "typesafe-actions";

/**
 * The user chooses to start the workflow to open a support request
 */
export const zendeskSupportStart = createStandardAction(
  "ZENDESK_SUPPORT_START"
)<void>();
/**
 * The user completes the workflow to open a support request
 */
export const zendeskSupportCompleted = createStandardAction(
  "ZENDESK_SUPPORT_COMPLETED"
)<void>();

/**
 * The user chooses to cancel the support request
 */
export const zendeskSupportCancel = createStandardAction(
  "ZENDESK_SUPPORT_CANCEL"
)<void>();

/**
 * The user chooses `back` from the first screen
 */
export const zendeskSupportBack = createStandardAction(
  "ZENDESK_SUPPORT_BACK"
)<void>();

/**
 * The workflow fails
 */
export const zendeskSupportFailure = createStandardAction(
  "ZENDESK_SUPPORT_FAILURE"
)<string>();

export type ZendeskSupportActions =
  | ActionType<typeof zendeskSupportStart>
  | ActionType<typeof zendeskSupportCompleted>
  | ActionType<typeof zendeskSupportCancel>
  | ActionType<typeof zendeskSupportBack>
  | ActionType<typeof zendeskSupportFailure>;
