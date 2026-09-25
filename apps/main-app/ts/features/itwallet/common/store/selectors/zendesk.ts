import { GlobalState } from "../../../../../store/reducers/types";
import {
  zendeskDocumentiSuIoCategory,
  zendeskItWalletCategory
} from "../../../../../utils/supportAssistance";
import {
  itwLifecycleIsITWalletValidSelector,
  itwLifecycleIsValidSelector
} from "../../../lifecycle/store/selectors";

/** Wallet status values of the Zendesk "Stato wallet" custom field. */
export enum ItwZendeskWalletStatus {
  DOCUMENTI_SU_IO = "documenti_su_io",
  IT_WALLET = "it_wallet",
  NOT_ACTIVE = "not_active"
}

/**
 * Returns the user's wallet status as expected by Zendesk, so support knows
 * what the user has actually activated regardless of the chosen category.
 */
export const itwZendeskWalletStatusSelector = (
  state: GlobalState
): ItwZendeskWalletStatus => {
  if (itwLifecycleIsITWalletValidSelector(state)) {
    return ItwZendeskWalletStatus.IT_WALLET;
  }
  return itwLifecycleIsValidSelector(state)
    ? ItwZendeskWalletStatus.DOCUMENTI_SU_IO
    : ItwZendeskWalletStatus.NOT_ACTIVE;
};

/**
 * Returns the Zendesk category for wallet support tickets: IT-Wallet users get
 * the IT-Wallet category, everyone else (including users with no wallet) gets
 * the Documenti su IO one.
 */
export const itwZendeskCategorySelector = (state: GlobalState) =>
  itwZendeskWalletStatusSelector(state) === ItwZendeskWalletStatus.IT_WALLET
    ? zendeskItWalletCategory
    : zendeskDocumentiSuIoCategory;
