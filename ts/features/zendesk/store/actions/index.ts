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

// user selected a category
export const zendeskSelectedCategory = createStandardAction(
  "ZENDESK_SELECTED_CATEGORY"
)<ZendeskCategory>();

export type ZendeskSupportActions =
  | ActionType<typeof zendeskSupportStart>
  | ActionType<typeof zendeskSupportCompleted>
  | ActionType<typeof zendeskSupportCancel>
  | ActionType<typeof zendeskSupportFailure>
  | ActionType<typeof getZendeskConfig>
  | ActionType<typeof zendeskSelectedCategory>;
