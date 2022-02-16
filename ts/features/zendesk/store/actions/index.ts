import {
  ActionType,
  createAsyncAction,
  createStandardAction
} from "typesafe-actions";
import { Zendesk } from "../../../../../definitions/content/Zendesk";
import { NetworkError } from "../../../../utils/errors";
import { ZendeskCategory } from "../../../../../definitions/content/ZendeskCategory";
import { FAQsCategoriesType } from "../../../../utils/faq";
import {
  ContextualHelpProps,
  ContextualHelpPropsMarkdown
} from "../../../../components/screens/BaseScreenComponent";

export type ZendeskStartPayload = {
  contextualHelp?: ContextualHelpProps;
  contextualHelpMarkdown?: ContextualHelpPropsMarkdown;
  faqCategories?: ReadonlyArray<FAQsCategoriesType>;
  startingRoute: string;
  assistanceForPayment: boolean;
};
/**
 * The user chooses to start the workflow to open a support request
 */
export const zendeskSupportStart = createStandardAction(
  "ZENDESK_SUPPORT_START"
)<ZendeskStartPayload>();
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
  "ZENDESK_CONFIG_REQUEST",
  "ZENDESK_CONFIG_SUCCESS",
  "ZENDESK_CONFIG_FAILURE"
)<void, Zendesk, NetworkError>();

// user selected a category
export const zendeskSelectedCategory = createStandardAction(
  "ZENDESK_SELECTED_CATEGORY"
)<ZendeskCategory>();

/**
 * Request the ticket the user opened in Zendesk
 */
export const zendeskRequestTicketNumber = createAsyncAction(
  "ZENDESK_TICKET_NUMBER_REQUEST",
  "ZENDESK_TICKET_NUMBER_SUCCESS",
  "ZENDESK_TICKET_NUMBER_FAILURE"
)<void, number, Error>();

// user selected a category
export const zendeskGetTotalNewResponses = createAsyncAction(
  "ZENDESK_GET_TOTAL_NEW_RESPONSES_REQUEST",
  "ZENDESK_GET_TOTAL_NEW_RESPONSES_SUCCESS",
  "ZENDESK_GET_TOTAL_NEW_RESPONSES_FAILURE"
)<void, number, Error>();

export type ZendeskSupportActions =
  | ActionType<typeof zendeskSupportStart>
  | ActionType<typeof zendeskSupportCompleted>
  | ActionType<typeof zendeskSupportCancel>
  | ActionType<typeof zendeskSupportBack>
  | ActionType<typeof zendeskSupportFailure>
  | ActionType<typeof getZendeskConfig>
  | ActionType<typeof zendeskSelectedCategory>
  | ActionType<typeof zendeskRequestTicketNumber>
  | ActionType<typeof zendeskGetTotalNewResponses>;
