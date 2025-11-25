import {
  ActionType,
  createAsyncAction,
  createStandardAction
} from "typesafe-actions";
import { Zendesk } from "../../../../../definitions/content/Zendesk";
import { ZendeskCategory } from "../../../../../definitions/content/ZendeskCategory";
import { ZendeskSubCategory } from "../../../../../definitions/content/ZendeskSubCategory";
import { ZendeskSubcategoriesErrors } from "../../../../../definitions/content/ZendeskSubcategoriesErrors";
import { NetworkError } from "../../../../utils/errors";
import { FAQsCategoriesType } from "../../../../utils/faq";
import {
  ContextualHelpProps,
  ContextualHelpPropsMarkdown
} from "../../../../utils/help";

export type ZendeskAssistanceType = Partial<{
  payment: boolean;
  card: boolean;
  fci: boolean;
  itWallet: boolean;
  idPay: boolean;
  send: boolean;
}>;

export type ZendeskStartPayload = {
  contextualHelp?: ContextualHelpProps;
  contextualHelpMarkdown?: ContextualHelpPropsMarkdown;
  faqCategories?: ReadonlyArray<FAQsCategoriesType>;
  startingRoute: string;
  assistanceType: ZendeskAssistanceType;
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
 * The zendesk getSession polling is stopped
 */
export const zendeskStopPolling = createStandardAction(
  "ZENDESK_STOP_POLLING"
)<void>();

/**
 * The zendesk getSession polling is iterated
 */
export const zendeskPollingIteration = createStandardAction(
  "ZENDESK_POLLING_ITERATION"
)<void>();

/**
 * The zendesk getSession polling is started
 */
export const zendeskStartPolling = createStandardAction(
  "ZENDESK_START_POLLING"
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
 * Request the zendesk token to getSession
 */
export const getZendeskToken = createAsyncAction(
  "GET_ZENDESK_TOKEN_REQUEST",
  "GET_ZENDESK_TOKEN_SUCCESS",
  "GET_ZENDESK_TOKEN_FAILURE"
)<undefined, undefined, "401" | void>();

/**
 * Request the zendesk config
 */
export const getZendeskConfig = createAsyncAction(
  "ZENDESK_CONFIG_REQUEST",
  "ZENDESK_CONFIG_SUCCESS",
  "ZENDESK_CONFIG_FAILURE"
)<void, Zendesk, NetworkError>();

/**
 * Request the zendesk payment config
 */
export const getZendeskPaymentConfig = createAsyncAction(
  "ZENDESK_PAYMENT_CONFIG_REQUEST",
  "ZENDESK_PAYMENT_CONFIG_SUCCESS",
  "ZENDESK_PAYMENT_CONFIG_FAILURE"
)<void, ZendeskSubcategoriesErrors, NetworkError>();

// user selected a category
export const zendeskSelectedCategory = createStandardAction(
  "ZENDESK_SELECTED_CATEGORY"
)<ZendeskCategory>();

// user selected a subcategory
export const zendeskSelectedSubcategory = createStandardAction(
  "ZENDESK_SELECTED_SUBCATEGORY"
)<ZendeskSubCategory>();

/**
 * Request the ticket the user opened in Zendesk
 */
export const zendeskRequestTicketNumber = createAsyncAction(
  "ZENDESK_TICKET_NUMBER_REQUEST",
  "ZENDESK_TICKET_NUMBER_SUCCESS",
  "ZENDESK_TICKET_NUMBER_FAILURE"
)<void, number, Error>();

export type ZendeskSupportActions =
  | ActionType<typeof zendeskSupportStart>
  | ActionType<typeof zendeskSupportCompleted>
  | ActionType<typeof zendeskStopPolling>
  | ActionType<typeof zendeskPollingIteration>
  | ActionType<typeof zendeskStartPolling>
  | ActionType<typeof zendeskSupportCancel>
  | ActionType<typeof zendeskSupportBack>
  | ActionType<typeof zendeskSupportFailure>
  | ActionType<typeof getZendeskToken>
  | ActionType<typeof getZendeskConfig>
  | ActionType<typeof zendeskSelectedCategory>
  | ActionType<typeof zendeskRequestTicketNumber>
  | ActionType<typeof zendeskSelectedSubcategory>
  | ActionType<typeof getZendeskPaymentConfig>;
