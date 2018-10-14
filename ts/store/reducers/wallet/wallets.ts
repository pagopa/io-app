/**
 * Reducers, states, selectors and guards for the cards
 */
import { none, Option, some } from "fp-ts/lib/Option";
import { AmountInEuroCents } from "italia-ts-commons/lib/pagopa";
import { values } from "lodash";
import { createSelector } from "reselect";
import { getType } from "typesafe-actions";
import { CreditCard, Wallet } from "../../../types/pagopa";
import * as pot from "../../../types/pot";
import { Action } from "../../actions/types";
import {
  creditCardDataCleanup,
  fetchWalletsFailure,
  fetchWalletsRequest,
  fetchWalletsSuccess,
  setFavoriteWallet,
  storeCreditCardData
} from "../../actions/wallet/wallets";
import { IndexedById, toIndexed } from "../../helpers/indexer";
import { GlobalState } from "../types";

export type WalletsState = Readonly<{
  walletById: pot.Pot<IndexedById<Wallet>>;
  favoriteWalletId: Option<number>;
  newCreditCard: Option<CreditCard>;
}>;

const WALLETS_INITIAL_STATE: WalletsState = {
  walletById: pot.none,
  favoriteWalletId: none,
  newCreditCard: none
};

// selectors
export const getWalletsById = (state: GlobalState) =>
  state.wallet.wallets.walletById;

const getWallets = createSelector(getWalletsById, potWx =>
  pot.map(
    potWx,
    wx => values(wx).filter(_ => _ !== undefined) as ReadonlyArray<Wallet>
  )
);

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

export const feeExtractor = (w: Wallet): AmountInEuroCents | undefined =>
  w.psp === undefined
    ? undefined
    : (("0".repeat(10) + `${w.psp.fixedCost.amount}`) as AmountInEuroCents);

// reducer
const reducer = (
  state: WalletsState = WALLETS_INITIAL_STATE,
  action: Action
): WalletsState => {
  switch (action.type) {
    case getType(fetchWalletsRequest):
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
      return {
        ...state,
        walletById: pot.toError(state.walletById, action.payload)
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

    default:
      return state;
  }
};

export default reducer;
