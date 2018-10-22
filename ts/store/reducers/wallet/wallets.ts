/**
 * Reducers, states, selectors and guards for the cards
 */
import { fromNullable, none, Option } from "fp-ts/lib/Option";
import { AmountInEuroCents } from "italia-ts-commons/lib/pagopa";
import { values } from "lodash";
import { createSelector } from "reselect";
import { getType } from "typesafe-actions";

import { Wallet } from "../../../types/pagopa";
import * as pot from "../../../types/pot";
import { PotFromActions } from "../../../types/utils";
import { Action } from "../../actions/types";
import {
  paymentUpdateWalletPspFailure,
  paymentUpdateWalletPspRequest,
  paymentUpdateWalletPspSuccess
} from "../../actions/wallet/payment";
import {
  addWalletCreditCardFailure,
  addWalletCreditCardInit,
  addWalletCreditCardRequest,
  addWalletCreditCardSuccess,
  creditCardCheckout3dsRequest,
  creditCardCheckout3dsSuccess,
  deleteWalletFailure,
  deleteWalletRequest,
  deleteWalletSuccess,
  fetchWalletsFailure,
  fetchWalletsRequest,
  fetchWalletsSuccess,
  payCreditCardVerificationFailure,
  payCreditCardVerificationRequest,
  payCreditCardVerificationSuccess,
  setFavoriteWallet
} from "../../actions/wallet/wallets";
import { IndexedById, toIndexed } from "../../helpers/indexer";
import { GlobalState } from "../types";

export type WalletsState = Readonly<{
  walletById: PotFromActions<IndexedById<Wallet>, typeof fetchWalletsFailure>;
  favoriteWalletId: Option<number>;
  creditCardAddWallet: PotFromActions<
    typeof addWalletCreditCardSuccess,
    typeof addWalletCreditCardFailure
  >;
  creditCardVerification: PotFromActions<
    typeof payCreditCardVerificationSuccess,
    typeof payCreditCardVerificationFailure
  >;
  creditCardCheckout3ds: PotFromActions<
    typeof creditCardCheckout3dsSuccess,
    never
  >;
}>;

const WALLETS_INITIAL_STATE: WalletsState = {
  walletById: pot.none,
  favoriteWalletId: none,
  creditCardAddWallet: pot.none,
  creditCardVerification: pot.none,
  creditCardCheckout3ds: pot.none
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

export const walletsSelector = createSelector(
  getWallets,
  // define whether an order among cards needs to be established
  // (e.g. by insertion date, expiration date, ...)
  (
    potWallets: ReturnType<typeof getWallets>
  ): pot.Pot<ReadonlyArray<Wallet>, Error> =>
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
    case getType(paymentUpdateWalletPspRequest):
    case getType(deleteWalletRequest):
      return {
        ...state,
        walletById: pot.toLoading(state.walletById)
      };

    case getType(fetchWalletsSuccess):
    case getType(paymentUpdateWalletPspSuccess):
    case getType(deleteWalletSuccess):
      return {
        ...state,
        walletById: pot.some(toIndexed(action.payload, _ => _.idWallet))
      };

    case getType(fetchWalletsFailure):
    case getType(deleteWalletFailure):
    case getType(paymentUpdateWalletPspFailure):
      return {
        ...state,
        walletById: pot.toError(state.walletById, action.payload)
      };

    case getType(setFavoriteWallet):
      return {
        ...state,
        favoriteWalletId: fromNullable(action.payload)
      };

    //
    // add credit card
    //

    case getType(addWalletCreditCardInit):
      return {
        ...state,
        creditCardAddWallet: pot.none,
        creditCardVerification: pot.none,
        creditCardCheckout3ds: pot.none
      };

    case getType(addWalletCreditCardRequest):
      return {
        ...state,
        creditCardAddWallet: pot.noneLoading
      };

    case getType(addWalletCreditCardSuccess):
      return {
        ...state,
        creditCardAddWallet: pot.some(action.payload)
      };

    case getType(addWalletCreditCardFailure):
      return {
        ...state,
        creditCardAddWallet: pot.noneError(action.payload)
      };

    //
    // pay credit card verification
    //

    case getType(payCreditCardVerificationRequest):
      return {
        ...state,
        creditCardVerification: pot.noneLoading
      };

    case getType(payCreditCardVerificationSuccess):
      return {
        ...state,
        creditCardVerification: pot.some(action.payload)
      };

    case getType(payCreditCardVerificationFailure):
      return {
        ...state,
        creditCardVerification: pot.noneError(action.payload)
      };

    //
    // credit card 3ds checkout
    //

    case getType(creditCardCheckout3dsRequest):
      // a valid URL has been made available
      // from pagoPA and needs to be opened in a webview
      const urlWithToken = `${action.payload.urlCheckout3ds}&sessionToken=${
        action.payload.pagopaToken
      }`;

      return {
        ...state,
        creditCardCheckout3ds: pot.someLoading(urlWithToken)
      };

    case getType(creditCardCheckout3dsSuccess):
      return {
        ...state,
        creditCardCheckout3ds: pot.some("done")
      };

    default:
      return state;
  }
};

export default reducer;
