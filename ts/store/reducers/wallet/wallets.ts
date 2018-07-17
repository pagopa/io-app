/**
 * Reducers, states, selectors and guards for the cards
 */
import { none, Option, some } from "fp-ts/lib/Option";
import { values } from "lodash";
import { createSelector } from "reselect";
import { Wallet } from "../../../../definitions/pagopa/Wallet";
import { getWalletId } from "../../../types/CreditCard";
import {
  SELECT_WALLET_FOR_DETAILS,
  SET_FAVORITE_WALLET,
  WALLETS_FETCHED
} from "../../actions/constants";
import { Action } from "../../actions/types";
import { IndexedById, toIndexed } from "../../helpers/indexer";
import { GlobalState } from "../types";

export type WalletsState = Readonly<{
  list: IndexedById<Wallet>;
  selectedWalletId: Option<number>;
  favoriteWalletId: Option<number>;
}>;

export const WALLETS_INITIAL_STATE: WalletsState = {
  list: {},
  selectedWalletId: none,
  favoriteWalletId: none
};

// selectors
export const getWallets = (state: GlobalState) => state.wallet.wallets.list;
export const getSelectedWalletId = (state: GlobalState) =>
  state.wallet.wallets.selectedWalletId;
export const getFavoriteWalletId = (state: GlobalState) =>
  state.wallet.wallets.favoriteWalletId;

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
  walletId.mapNullable(wId =>
    values(wallets).find(c => getWalletId(c) === wId)
  );

export const selectedWalletSelector = createSelector(
  getSelectedWalletId,
  getWallets,
  getWalletFromId
);

export const favoriteWalletSelector = createSelector(
  getFavoriteWalletId,
  getWallets,
  getWalletFromId
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
  return state;
};

export default reducer;
