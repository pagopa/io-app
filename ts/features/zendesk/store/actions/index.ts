import {
  ActionType,
  createAsyncAction,
  createStandardAction
} from "typesafe-actions";
import { Zendesk } from "../../../../../definitions/content/Zendesk";
import { NetworkError } from "../../../../utils/errors";
import { ZendeskCategory } from "../../../../../definitions/content/ZendeskCategory";

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

/**
 * Request the zendesk config
 */
export const getZendeskConfig = createAsyncAction(
  "GET_ZENDESK_CONFIG_REQUEST",
  "GET_ZENDESK_CONFIG_SUCCESS",
  "GET_ZENDESK_CONFIG_FAILURE"
)<void, Zendesk, NetworkError>();

/**
 * The workflow fails
 */
export const zendeskSelectedCategory = createStandardAction(
  "ZENDESK_SELECTED_CATEGORY"
)<ZendeskCategory>();

export type ZendeskSupportActions =
  | ActionType<typeof zendeskSupportStart>
  | ActionType<typeof zendeskSupportCompleted>
  | ActionType<typeof zendeskSupportCancel>
  | ActionType<typeof zendeskSupportBack>
  | ActionType<typeof zendeskSupportFailure>
  | ActionType<typeof getZendeskConfig>
  | ActionType<typeof zendeskSelectedCategory>;
