/**
 * Reducers, states, selectors and guards for the cards
 */
import { fromNullable, none, Option } from "fp-ts/lib/Option";
import { AmountInEuroCents } from "italia-ts-commons/lib/pagopa";
import { values } from "lodash";
import { createSelector } from "reselect";
import { getType } from "typesafe-actions";
import { CreditCard, Wallet } from "../../../types/pagopa";
import * as pot from "../../../types/pot";
import { Action } from "../../actions/types";
import {
  creditCardDataCleanup,
  deleteWalletFailure,
  deleteWalletRequest,
  deleteWalletSuccess,
  fetchWalletsFailure,
  fetchWalletsRequest,
  fetchWalletsSuccess,
  setFavoriteWallet
} from "../../actions/wallet/wallets";
import { IndexedById, toIndexed } from "../../helpers/indexer";
import { GlobalState } from "../types";

export type WalletsState = Readonly<{
  walletById: pot.Pot<IndexedById<Wallet>>;
  favoriteWalletId: Option<number>;
  newCreditCard: pot.Pot<CreditCard>;
}>;

const WALLETS_INITIAL_STATE: WalletsState = {
  walletById: pot.none,
  favoriteWalletId: none,
  newCreditCard: pot.none
};

// selectors
export const getWalletsById = (state: GlobalState) =>
  state.wallet.wallets.walletById;

export const getWalletsByIdOption = (state: GlobalState) =>
  pot.toOption(state.wallet.wallets.walletById);

export const getWallets = createSelector(getWalletsById, potWx =>
  pot.map(
    potWx,
    wx => values(wx).filter(_ => _ !== undefined) as ReadonlyArray<Wallet>
  )
);

export const getWalletsOption = createSelector(getWallets, pot.toOption);

export const getFavoriteWalletId = (state: GlobalState) =>
  state.wallet.wallets.favoriteWalletId;
export const getFavoriteWallet = (state: GlobalState) =>
  state.wallet.wallets.favoriteWalletId.mapNullable(walletId =>
    pot.toUndefined(
      pot.map(state.wallet.wallets.walletById, wx => wx[walletId])
    )
  );

export const getNewCreditCard = (state: GlobalState) =>
  state.wallet.wallets.newCreditCard;

export const walletsSelector = createSelector(
  getWallets,
  // define whether an order among cards needs to be established
  // (e.g. by insertion date, expiration date, ...)
  (potWallets: ReturnType<typeof getWallets>): pot.Pot<ReadonlyArray<Wallet>> =>
    pot.map(potWallets, wallets =>
      [...wallets].sort(
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
    )
);

/**
 * Returns the fee for a wallet that has a preferred psp
 */
export const feeForWallet = (w: Wallet): Option<AmountInEuroCents> =>
  fromNullable(w.psp).map(
    psp => ("0".repeat(10) + `${psp.fixedCost.amount}`) as AmountInEuroCents
  );

// reducer
const reducer = (
  state: WalletsState = WALLETS_INITIAL_STATE,
  action: Action
): WalletsState => {
  switch (action.type) {
    //
    // fetch wallets
    //

    case getType(fetchWalletsRequest):
    case getType(deleteWalletRequest):
      return {
        ...state,
        walletById: pot.toLoading(state.walletById)
      };

    case getType(fetchWalletsSuccess):
      return {
        ...state,
        walletById: pot.some(toIndexed(action.payload, _ => _.idWallet))
      };

    case getType(fetchWalletsFailure):
    case getType(deleteWalletFailure):
      return {
        ...state,
        walletById: pot.toError(state.walletById, action.payload)
      };

    case getType(deleteWalletSuccess):
      return {
        ...state,
        walletById: pot.isSome(state.walletById)
          ? pot.some(state.walletById.value)
          : pot.none
      };

    case getType(setFavoriteWallet):
      return {
        ...state,
        favoriteWalletId: fromNullable(action.payload)
      };

    /**
     * clean up "newCreditCard" after it has been
     * added to pagoPA
     */
    case getType(creditCardDataCleanup):
      return {
        ...state,
        newCreditCard: pot.none
      };

    default:
      return state;
  }
};

export default reducer;
