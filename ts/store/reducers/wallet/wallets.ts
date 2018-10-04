/**
 * Reducers, states, selectors and guards for the cards
 */
import { none, Option, some } from "fp-ts/lib/Option";
import { AmountInEuroCents } from "italia-ts-commons/lib/pagopa";
import { values } from "lodash";
import { createSelector } from "reselect";
import { getType } from "typesafe-actions";
import { CreditCard, Wallet } from "../../../types/pagopa";
import { PAYMENT_UPDATE_PSP_IN_STATE } from "../../actions/constants";
import { Action } from "../../actions/types";
import {
  creditCardDataCleanup,
  fetchWalletsSuccess,
  selectWalletForDetails,
  setFavoriteWallet,
  storeCreditCardData
} from "../../actions/wallet/wallets";
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
  (wallets: IndexedById<Wallet>): ReadonlyArray<Wallet> =>
    values(wallets).sort(
      // sort by date, descending
      // if both dates are undefined -> 0
      // if either is undefined, it is considered as used "infinitely" long ago
      // (i.e. the non-undefined one is considered as used more recently)
      (a, b) =>
        -(a.lastUsage === undefined
          ? b.lastUsage === undefined
            ? 0
            : -1
          : b.lastUsage === undefined
            ? 1
            : a.lastUsage.getTime() - b.lastUsage.getTime())
    )
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
  switch (action.type) {
    case getType(fetchWalletsSuccess):
      return {
        ...state,
        list: toIndexed(action.payload, "idWallet")
      };

    case getType(selectWalletForDetails):
      return {
        ...state,
        selectedWalletId: some(action.payload)
      };

    case getType(setFavoriteWallet):
      return {
        ...state,
        favoriteWalletId: action.payload
      };

    /**
     * Store the credit card information locally
     * before sending it to pagoPA
     */
    case getType(storeCreditCardData):
      return {
        ...state,
        newCreditCard: some(action.payload)
      };

    /**
     * clean up "newCreditCard" after it has been
     * added to pagoPA
     */
    case getType(creditCardDataCleanup):
      return {
        ...state,
        newCreditCard: none
      };

    // TODO: temporary, until the integration with pagoPA
    // (then, the psp will be updated on the server side,
    // and, by fetching the existing cards the psp will be
    // automatically updated)
    case PAYMENT_UPDATE_PSP_IN_STATE:
      return {
        ...state,
        list: {
          ...state.list,
          [action.walletId]: {
            ...state.list[action.walletId],
            idPsp: action.payload.id,
            psp: action.payload
          }
        }
      };

    default:
      return state;
  }
};

export default reducer;
