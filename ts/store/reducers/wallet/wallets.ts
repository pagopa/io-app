/**
 * Reducers, states, selectors and guards for the cards
 */
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
  setFavouriteWalletFailure,
  setFavouriteWalletRequest,
  setFavouriteWalletSuccess
} from "../../actions/wallet/wallets";
import { IndexedById, toIndexed } from "../../helpers/indexer";
import { GlobalState } from "../types";

export type WalletsState = Readonly<{
  walletById: PotFromActions<IndexedById<Wallet>, typeof fetchWalletsFailure>;
  favoriteWalletId: pot.Pot<Wallet["idWallet"], Error>;
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
  favoriteWalletId: pot.none,
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
  pot.mapNullable(state.wallet.wallets.favoriteWalletId, walletId =>
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
        favoriteWalletId: pot.toLoading(state.favoriteWalletId),
        walletById: pot.toLoading(state.walletById)
      };

    case getType(fetchWalletsSuccess):
    case getType(paymentUpdateWalletPspSuccess):
    case getType(deleteWalletSuccess):
      const favouriteWallet = action.payload.find(_ => _.favourite === true);
      const newState = {
        ...state,
        walletById: pot.some(toIndexed(action.payload, _ => _.idWallet))
      };
      return favouriteWallet !== undefined
        ? {
            ...newState,
            favoriteWalletId: pot.some(favouriteWallet.idWallet)
          }
        : newState;

    case getType(fetchWalletsFailure):
    case getType(deleteWalletFailure):
    case getType(paymentUpdateWalletPspFailure):
      return {
        ...state,
        favoriteWalletId: pot.toError(state.favoriteWalletId, action.payload),
        walletById: pot.toError(state.walletById, action.payload)
      };

    //
    // set favourite wallet
    //

    case getType(setFavouriteWalletRequest):
      return {
        ...state,
        favoriteWalletId:
          action.payload === undefined
            ? pot.none
            : pot.toUpdating(state.favoriteWalletId, action.payload)
      };

    case getType(setFavouriteWalletSuccess):
      // On success, we update both the favourite wallet ID and the
      // corresponding Wallet in walletById.
      // Note that we don't update the Wallet that was previously the
      // favourite one.
      return {
        ...state,
        favoriteWalletId: pot.some(action.payload.idWallet),
        walletById: {
          ...state.walletById,
          [action.payload.idWallet]: action.payload
        }
      };

    case getType(setFavouriteWalletFailure):
      return {
        ...state,
        favoriteWalletId: pot.toError(state.favoriteWalletId, action.payload)
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
        action.payload.paymentManagerToken
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
