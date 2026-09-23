import { GlobalState } from "../../../../../store/reducers/types";
import {
  zendeskDocumentiSuIoCategory,
  zendeskItWalletCategory
} from "../../../../../utils/supportAssistance";
import { itwLifecycleIsITWalletValidSelector } from "../../../lifecycle/store/selectors";

/**
 * Returns the Zendesk category for wallet support tickets, so support can tell
 * IT-Wallet users apart from Documenti su IO users (including users with no wallet).
 */
export const itwZendeskCategorySelector = (state: GlobalState) =>
  itwLifecycleIsITWalletValidSelector(state)
    ? zendeskItWalletCategory
    : zendeskDocumentiSuIoCategory;
