/**
 * A reducer that manages loading state for all the actions dispatched.
 * To work the actions need to use the conventional flux/redux naming:
 *
 * - ACTION_NAME_(REQUEST|CANCEL|SUCCESS|FAILURE)
 */

import { isActionOf } from "typesafe-actions";

import { FetchRequestActionsType } from "../actions/constants";
import { Action } from "../actions/types";
import {
  paymentResetLoadingState,
  paymentSetLoadingState
} from "../actions/wallet/payment";
import {
  walletManagementResetLoadingState,
  walletManagementSetLoadingState
} from "../actions/wallet/wallets";
import { GlobalState } from "./types";

export type LoadingState = Readonly<
  { [key in FetchRequestActionsType]: boolean }
>;

const INITIAL_STATE: LoadingState = {
  TOS_ACCEPT: false,
  PIN_CREATE: false,
  PROFILE_LOAD: false,
  PROFILE_UPSERT: false,
  MESSAGE_WITH_RELATIONS_LOAD: false,
  MESSAGES_LOAD: false,
  LOGOUT: false,
  PAYMENT: false,
  WALLET_MANAGEMENT_LOAD: false,
  FETCH_WALLETS: false,
  FETCH_TRANSACTIONS: false
};

/**
 * Create a selector that returns true if any of the actions passed as parameter
 * is in "loading" state.
 *
 * USAGE: `createLoadingSelector(['PROFILE_LOAD', 'PREFERENCES_LOAD'])`
 */
export const createLoadingSelector = (
  actions: ReadonlyArray<FetchRequestActionsType>
): ((_: GlobalState) => boolean) => (state: GlobalState): boolean => {
  return actions.some(
    (action: FetchRequestActionsType): boolean => state.loading[action]
  );
};

// Listen for _REQUEST|_CANCEL|_SUCCESS|_FAILURE actions and set/remove loading state.
const reducer = (
  state: LoadingState = INITIAL_STATE,
  action: Action
): LoadingState => {
  /**
   * The payment process has multiple occurrences
   * where the loading state needs to be set/reset
   * (additionally, sometimes there occurrences follow
   * one another immediately)
   * Instead of handling each *_REQUEST individually,
   * we're using dedicated set/reset actions
   */
  if (isActionOf(paymentSetLoadingState, action)) {
    return {
      ...state,
      PAYMENT: true
    };
  }
  if (isActionOf(paymentResetLoadingState, action)) {
    return {
      ...state,
      PAYMENT: false
    };
  }

  /**
   * The wallet management processes are aggregated
   * under WALLET_MANAGEMENT (it currently includes
   * deletion and "setting as favourite" of wallets)
   */
  if (isActionOf(walletManagementSetLoadingState, action)) {
    return {
      ...state,
      WALLET_MANAGEMENT_LOAD: true
    };
  }
  if (isActionOf(walletManagementResetLoadingState, action)) {
    return {
      ...state,
      WALLET_MANAGEMENT_LOAD: false
    };
  }

  const matches = /(.*)_(REQUEST|CANCEL|SUCCESS|FAILURE)/.exec(action.type);

  // Not a *_REQUEST / *_CANCEL / *_SUCCESS /  *_FAILURE action, so we ignore it
  if (!matches) {
    return state;
  }

  const [, requestName, requestState] = matches;
  return {
    ...state,
    // Store whether a request is happening at the moment or not
    [requestName]: requestState === "REQUEST"
  };
};

export default reducer;
