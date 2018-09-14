/**
 * Reducers, states, selectors and guards for the cards
 */
import { none, Option, some } from "fp-ts/lib/Option";
import { AmountInEuroCents } from "italia-ts-commons/lib/pagopa";
import { values } from "lodash";
import { createSelector } from "reselect";
import { CreditCard, Wallet } from "../../../types/pagopa";
import {
  CREDIT_CARD_DATA_CLEANUP,
  PAYMENT_UPDATE_PSP_IN_STATE,
  SELECT_WALLET_FOR_DETAILS,
  SET_FAVORITE_WALLET,
  STORE_CREDIT_CARD_DATA,
  WALLETS_FETCHED
} from "../../actions/constants";
import { Action } from "../../actions/types";
import { IndexedById, toIndexed } from "../../helpers/indexer";
import { GlobalState } from "../types";

export type WalletsState = Readonly<{
  list: IndexedById<Wallet>;
  selectedWalletId: Option<number>;
  favoriteWalletId: Option<number>;
  newCreditCard: Option<CreditCard>;
}>;

const WALLETS_INITIAL_STATE: WalletsState = {
  list: {},
  selectedWalletId: none,
  favoriteWalletId: none,
  newCreditCard: none
};

// selectors
export const getWallets = (state: GlobalState) => state.wallet.wallets.list;
export const getSelectedWalletId = (state: GlobalState) =>
  state.wallet.wallets.selectedWalletId;
export const getFavoriteWalletId = (state: GlobalState) =>
  state.wallet.wallets.favoriteWalletId;
export const getNewCreditCard = (state: GlobalState) =>
  state.wallet.wallets.newCreditCard;

export const walletsSelector = createSelector(
  getWallets,
  // define whether an order among cards needs to be established
  // (e.g. by insertion date, expiration date, ...)
  (wallets: IndexedById<Wallet>): ReadonlyArray<Wallet> => values(wallets)
);

export const getWalletFromId = (
  walletId: Option<number>,
  wallets: IndexedById<Wallet>
): Option<Wallet> =>
  walletId.mapNullable(wId => values(wallets).find(c => c.idWallet === wId));

export const selectedWalletSelector = createSelector(
  getSelectedWalletId,
  getWallets,
  getWalletFromId
);

export const specificWalletSelector = (walletId: number) =>
  createSelector(() => some(walletId), getWallets, getWalletFromId);

export const feeExtractor = (w: Wallet): AmountInEuroCents | undefined =>
  w.psp === undefined
    ? undefined
    : (("0".repeat(10) + `${w.psp.fixedCost.amount}`) as AmountInEuroCents);

export const walletCountSelector = createSelector(
  getWallets,
  (wallets: IndexedById<Wallet>) => Object.keys(wallets).length
);

// reducer
const reducer = (
  state: WalletsState = WALLETS_INITIAL_STATE,
  action: Action
): WalletsState => {
  if (action.type === WALLETS_FETCHED) {
    return {
      ...state,
      list: toIndexed(action.payload, "idWallet")
    };
  }
  if (action.type === SELECT_WALLET_FOR_DETAILS) {
    return {
      ...state,
      selectedWalletId: some(action.payload)
    };
  }
  if (action.type === SET_FAVORITE_WALLET) {
    return {
      ...state,
      favoriteWalletId: action.payload
    };
  }
  /**
   * Store the credit card information locally
   * before sending it to pagoPA
   */
  if (action.type === STORE_CREDIT_CARD_DATA) {
    return {
      ...state,
      newCreditCard: some(action.payload)
    };
  }
  /**
   * clean up "newCreditCard" after it has been
   * added to pagoPA
   */
  if (action.type === CREDIT_CARD_DATA_CLEANUP) {
    return {
      ...state,
      newCreditCard: none
    };
  }
  // TODO: temporary, until the integration with pagoPA
  // (then, the psp will be updated on the server side,
  // and, by fetching the existing cards the psp will be
  // automatically updated)
  if (action.type === PAYMENT_UPDATE_PSP_IN_STATE) {
    const newWallet = {
      ...state.list[action.walletId],
      idPsp: action.payload.id,
      psp: action.payload
    };
    return {
      ...state,
      list: {
        ...state.list,
        [action.walletId]: newWallet
      }
    };
  }
  return state;
};

export default reducer;
