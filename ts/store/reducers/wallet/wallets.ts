/**
 * Reducers, states, selectors and guards for the cards
 */
import * as pot from "@pagopa/ts-commons/lib/pot";
import _, { values } from "lodash";
import { PersistPartial } from "redux-persist";
import { createSelector } from "reselect";
import { getType, isOfType } from "typesafe-actions";
import { WalletTypeEnum } from "../../../../definitions/pagopa/WalletV2";
import {
  getValueOrElse,
  remoteError,
  remoteLoading,
  remoteReady,
  remoteUndefined,
  RemoteValue
} from "../../../features/bonus/bpd/model/RemoteValue";
import { abiSelector } from "../../../features/wallet/onboarding/store/abi";
import {
  BancomatPaymentMethod,
  BPayPaymentMethod,
  CreditCardPaymentMethod,
  isBancomat,
  isBPay,
  isCreditCard,
  isPayPal,
  isPrivativeCard,
  isRawCreditCard,
  isSatispay,
  PaymentMethod,
  PayPalPaymentMethod,
  PrivativePaymentMethod,
  RawCreditCardPaymentMethod,
  RawPaymentMethod,
  SatispayPaymentMethod,
  Wallet
} from "../../../types/pagopa";

import { EnableableFunctionsEnum } from "../../../../definitions/pagopa/EnableableFunctions";
import { TypeEnum } from "../../../../definitions/pagopa/walletv2/CardInfo";
import { optInPaymentMethodsStart } from "../../../features/bonus/bpd/store/actions/optInPaymentMethods";
import { PotFromActions } from "../../../types/utils";
import { getErrorFromNetworkError } from "../../../utils/errors";
import { isDefined } from "../../../utils/guards";
import { enhancePaymentMethod } from "../../../utils/paymentMethod";
import { hasPaymentFeature } from "../../../utils/paymentMethodCapabilities";
import { hasFunctionEnabled } from "../../../utils/walletv2";
import { sessionExpired, sessionInvalid } from "../../actions/authentication";
import { clearCache } from "../../actions/profile";
import { Action } from "../../actions/types";
import {
  DeleteAllByFunctionError,
  DeleteAllByFunctionSuccess,
  deleteAllPaymentMethodsByFunction
} from "../../actions/wallet/delete";
import { paymentUpdateWalletPsp } from "../../actions/wallet/payment";
import {
  addWalletCreditCardFailure,
  addWalletCreditCardInit,
  addWalletCreditCardRequest,
  addWalletCreditCardSuccess,
  addWalletCreditCardWithBackoffRetryRequest,
  deleteWalletFailure,
  deleteWalletRequest,
  deleteWalletSuccess,
  fetchWalletsFailure,
  fetchWalletsRequest,
  fetchWalletsRequestWithExpBackoff,
  fetchWalletsSuccess,
  setFavouriteWalletFailure,
  setFavouriteWalletRequest,
  setFavouriteWalletSuccess,
  updatePaymentStatus
} from "../../actions/wallet/wallets";
import { IndexedById, toIndexed } from "../../helpers/indexer";
import { GlobalState } from "../types";

export type WalletsState = Readonly<{
  walletById: PotFromActions<IndexedById<Wallet>, typeof fetchWalletsFailure>;
  creditCardAddWallet: PotFromActions<
    typeof addWalletCreditCardSuccess,
    typeof addWalletCreditCardFailure
  >;
  deleteAllByFunction: RemoteValue<
    Pick<DeleteAllByFunctionSuccess, "deletedMethodsCount">,
    DeleteAllByFunctionError
  >;
  updatingFavouriteWallet: pot.Pot<number | undefined, Error>;
}>;

export type PersistedWalletsState = WalletsState & PersistPartial;

export const WALLETS_INITIAL_STATE: WalletsState = {
  walletById: pot.none,
  creditCardAddWallet: pot.none,
  deleteAllByFunction: remoteUndefined,
  // holds the state of updating a wallet as favourite
  updatingFavouriteWallet: pot.none
};

// Selectors
export const getAllWallets = (state: GlobalState): WalletsState =>
  state.wallet.wallets;

export const getWalletsById = (state: GlobalState) =>
  state.wallet.wallets.walletById;

const getWallets = createSelector(
  getWalletsById,
  (potWx): pot.Pot<ReadonlyArray<Wallet>, Error> =>
    pot.map(potWx, wx => values(wx).filter(isDefined))
);

// return the wallet number that the user is setting as a favourite
export const updatingFavouriteWalletSelector = createSelector(
  getAllWallets,
  (wallets: WalletsState): pot.Pot<number | undefined, Error> =>
    wallets.updatingFavouriteWallet
);

// return a pot with the id of the favorite wallet. none otherwise
export const getFavoriteWalletId = createSelector(
  getWallets,
  (potWx: ReturnType<typeof getWallets>): pot.Pot<number, Error> =>
    pot.mapNullable(
      potWx,
      wx => values(wx).find(w => w.favourite === true)?.idWallet
    )
);

export const getFavoriteWallet = createSelector(
  [getFavoriteWalletId, getWalletsById],
  (
    favoriteWalletID: pot.Pot<number, Error>,
    walletsById: WalletsState["walletById"]
  ): pot.Pot<Wallet, Error> =>
    pot.mapNullable(favoriteWalletID, walletId =>
      pot.toUndefined(pot.map(walletsById, wx => wx[walletId]))
    )
);

/**
 * Select a payment method using the id (walletId) and extracts the payment status (is the payment enabled on this payment method?)
 * Return pot.some(undefined) if no payment methods with the id are found
 */
export const getPaymentStatusById = createSelector(
  [getWalletsById, (_: GlobalState, id: number) => id],
  (potWalletsById, id): pot.Pot<boolean | undefined, Error> =>
    pot.map(
      potWalletsById,
      walletsById => walletsById[id]?.paymentMethod?.pagoPA
    )
);

/**
 * @deprecated Using API v2 this selector is deprecated
 * If you are searching for credit card or bancomat use {@link creditCardWalletV1Selector}
 * - {@link pagoPaCreditCardWalletV1Selector} {@link bancomatListSelector} instead
 */
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
 * Get a list of the payment methods in the wallet
 */
export const paymentMethodsSelector = createSelector(
  [walletsSelector, abiSelector],
  (potWallet, remoteAbi): pot.Pot<ReadonlyArray<PaymentMethod>, Error> =>
    pot.map(potWallet, wallets =>
      wallets
        .map(w =>
          w.paymentMethod
            ? enhancePaymentMethod(
                w.paymentMethod,
                getValueOrElse(remoteAbi, {})
              )
            : undefined
        )
        .filter(isDefined)
    )
);

// return those payment methods that can pay with pagoPA
export const withPaymentFeatureSelector = createSelector(
  paymentMethodsSelector,
  (
    potPm: ReturnType<typeof paymentMethodsSelector>
  ): ReadonlyArray<PaymentMethod> =>
    pot.getOrElse(
      pot.map(potPm, pms => pms.filter(hasPaymentFeature)),
      []
    )
);

// return those payment methods that have BPD as enabled function
export const getBPDMethodsSelector = createSelector(
  paymentMethodsSelector,
  (
    potPm: ReturnType<typeof paymentMethodsSelector>
  ): ReadonlyArray<PaymentMethod> =>
    pot.getOrElse(
      pot.map(potPm, pms =>
        pms.filter(pm => hasFunctionEnabled(pm, EnableableFunctionsEnum.BPD))
      ),
      []
    )
);

/**
 * return true if the payment method is visible in the wallet (the onboardingChannel
 * is IO or WISP) or if the onboardingChannel is undefined.
 * We choose to show cards with onboardingChannel undefined to ensure backward compatibility
 * with cards inserted before the field was added.
 * Explicitly handling the undefined is a conservative choice, as the field should be an enum (IO, WISP, EXT)
 * but it is a string and therefore we cannot be sure that incorrect data will not arrive.
 *
 * @param pm
 */
const visibleOnboardingChannels = ["IO", "WISP", undefined];
export const isVisibleInWallet = (pm: PaymentMethod): boolean =>
  visibleOnboardingChannels.some(
    oc => oc === pm.onboardingChannel?.toUpperCase().trim()
  );

// return those payment methods that have BPD as enabled function and are visible in Wallet
export const getBPDMethodsVisibleInWalletSelector = createSelector(
  getBPDMethodsSelector,
  (
    pms: ReturnType<typeof getBPDMethodsSelector>
  ): ReadonlyArray<PaymentMethod> => pms.filter(isVisibleInWallet)
);

export const rawCreditCardListSelector = createSelector(
  [paymentMethodsSelector],
  (
    paymentMethods: pot.Pot<ReadonlyArray<RawPaymentMethod>, Error>
  ): ReadonlyArray<RawCreditCardPaymentMethod> =>
    pot.getOrElse(
      pot.map(paymentMethods, w => w.filter(isRawCreditCard)),
      []
    )
);

/**
 * Return a bancomat list enhanced with the additional abi information in the wallet
 */
export const bancomatListSelector = createSelector(
  [paymentMethodsSelector],
  (paymentMethodPot): pot.Pot<ReadonlyArray<BancomatPaymentMethod>, Error> =>
    pot.map(paymentMethodPot, paymentMethod => paymentMethod.filter(isBancomat))
);

/**
 * Return a credit card list in the wallet
 */
export const creditCardListSelector = createSelector(
  [paymentMethodsSelector],
  (paymentMethodPot): pot.Pot<ReadonlyArray<CreditCardPaymentMethod>, Error> =>
    pot.map(paymentMethodPot, paymentMethod =>
      paymentMethod.filter(isCreditCard)
    )
);

/**
 * from a given ID return the relative {@link PaymentMethod} or undefined
 */
export const paymentMethodByIdSelector = createSelector(
  [paymentMethodsSelector, (_: GlobalState, id: number) => id],
  (potWallets, id): PaymentMethod | undefined =>
    pot.toUndefined(
      pot.map(potWallets, wallets => wallets.find(cc => cc.idWallet === id))
    )
);

/**
 * Return a {@link CreditCardPaymentMethod} by walletId
 * Return undefined if not in list
 */
export const creditCardByIdSelector = createSelector(
  [creditCardListSelector, (_: GlobalState, id: number) => id],
  (potCreditCardList, id): CreditCardPaymentMethod | undefined =>
    pot.toUndefined(
      pot.map(potCreditCardList, creditCardList =>
        creditCardList.find(cc => cc.idWallet === id)
      )
    )
);

/**
 * Return the paypal list in the wallet
 */
export const paypalListSelector = createSelector(
  [paymentMethodsSelector],
  (paymentMethodPot): pot.Pot<ReadonlyArray<PayPalPaymentMethod>, Error> =>
    pot.map(paymentMethodPot, paymentMethod => paymentMethod.filter(isPayPal))
);

/**
 * Return a privative card list in the wallet
 */
export const privativeListSelector = createSelector(
  [paymentMethodsSelector],
  (paymentMethodPot): pot.Pot<ReadonlyArray<PrivativePaymentMethod>, Error> =>
    pot.map(paymentMethodPot, paymentMethod =>
      paymentMethod.filter(isPrivativeCard)
    )
);

/**
 * Return a satispay list in the wallet
 */
export const satispayListSelector = createSelector(
  [paymentMethodsSelector],
  (paymentMethodPot): pot.Pot<ReadonlyArray<SatispayPaymentMethod>, Error> =>
    pot.map(paymentMethodPot, paymentMethod => paymentMethod.filter(isSatispay))
);

/**
 * Return the paypal (only 1 can be in the wallet) payment method
 */
export const paypalSelector = createSelector(
  [paymentMethodsSelector],
  (paymentMethodPot): pot.Pot<PayPalPaymentMethod, Error> =>
    pot.mapNullable(paymentMethodPot, paymentMethod =>
      paymentMethod.find(isPayPal)
    )
);

/**
 * Return a BPay list in the wallet
 */
export const bPayListSelector = createSelector(
  [paymentMethodsSelector],
  (paymentMethodPot): pot.Pot<ReadonlyArray<BPayPaymentMethod>, Error> =>
    pot.map(paymentMethodPot, paymentMethod => paymentMethod.filter(isBPay))
);

/**
 * Return all the payment methods visible in wallet screen.
 * First return the payment method that have pagoPA capability
 */
export const paymentMethodListVisibleInWalletSelector = createSelector(
  [paymentMethodsSelector],
  (paymentMethodsPot): pot.Pot<ReadonlyArray<PaymentMethod>, Error> =>
    pot.map(paymentMethodsPot, paymentMethodList =>
      _.sortBy(paymentMethodList.filter(isVisibleInWallet), pm =>
        hasPaymentFeature(pm) ? -1 : pm.idWallet
      )
    )
);

/**
 * Return a credit card list visible in the wallet
 */
export const creditCardListVisibleInWalletSelector = createSelector(
  [creditCardListSelector],
  (creditCardListPot): pot.Pot<ReadonlyArray<CreditCardPaymentMethod>, Error> =>
    pot.map(creditCardListPot, creditCardList =>
      creditCardList.filter(isVisibleInWallet)
    )
);

/**
 * Return a bancomat list visible in the wallet
 */
export const bancomatListVisibleInWalletSelector = createSelector(
  [bancomatListSelector],
  (bancomatListPot): pot.Pot<ReadonlyArray<BancomatPaymentMethod>, Error> =>
    pot.map(bancomatListPot, bancomatList =>
      bancomatList.filter(isVisibleInWallet)
    )
);

/**
 * Return a satispay list visible in the wallet
 */
export const satispayListVisibleInWalletSelector = createSelector(
  [satispayListSelector],
  (satispayListPot): pot.Pot<ReadonlyArray<SatispayPaymentMethod>, Error> =>
    pot.map(satispayListPot, satispayList =>
      satispayList.filter(isVisibleInWallet)
    )
);

/**
 * Return a BPay list visible in the wallet
 */
export const bPayListVisibleInWalletSelector = createSelector(
  [bPayListSelector],
  (bPayListPot): pot.Pot<ReadonlyArray<BPayPaymentMethod>, Error> =>
    pot.map(bPayListPot, bPayList => bPayList.filter(isVisibleInWallet))
);

/**
 * Return a CoBadge list visible in the wallet
 */
export const cobadgeListVisibleInWalletSelector = createSelector(
  [creditCardListVisibleInWalletSelector],
  (creditCardListPot): pot.Pot<ReadonlyArray<CreditCardPaymentMethod>, Error> =>
    pot.map(creditCardListPot, creditCardList =>
      creditCardList.filter(
        cc =>
          cc.pagoPA === false &&
          cc.info.issuerAbiCode !== undefined &&
          cc.info.type !== TypeEnum.PRV
      )
    )
);

/**
 * Return a Privative card list visible in the wallet
 */
export const privativeListVisibleInWalletSelector = createSelector(
  [privativeListSelector],
  (privativeListPot): pot.Pot<ReadonlyArray<PrivativePaymentMethod>, Error> =>
    pot.map(privativeListPot, privativeList =>
      privativeList.filter(isVisibleInWallet)
    )
);

/**
 * Get the list of credit cards using the info contained in v2 (Walletv2) to distinguish
 */
export const creditCardWalletV1Selector = createSelector(
  [walletsSelector],
  (
    potWallet: pot.Pot<ReadonlyArray<Wallet>, Error>
  ): pot.Pot<ReadonlyArray<Wallet>, Error> =>
    pot.map(potWallet, wallets =>
      wallets.filter(
        w =>
          w.paymentMethod && w.paymentMethod.walletType === WalletTypeEnum.Card
      )
    )
);

/**
 * Get the list of credit cards usable as payment instrument in pagoPA
 * using the info contained in v2 (Walletv2) to distinguish
 */
export const pagoPaCreditCardWalletV1Selector = createSelector(
  [creditCardWalletV1Selector],
  (
    potCreditCards: pot.Pot<ReadonlyArray<Wallet>, Error>
  ): pot.Pot<ReadonlyArray<Wallet>, Error> =>
    pot.map(potCreditCards, wallets =>
      wallets.filter(w => w.paymentMethod?.pagoPA === true)
    )
);

export const deleteAllPaymentMethodsByFunctionSelector = (
  state: GlobalState
): WalletsState["deleteAllByFunction"] =>
  state.wallet.wallets.deleteAllByFunction;

// reducer
// eslint-disable-next-line complexity
const reducer = (
  state: WalletsState = WALLETS_INITIAL_STATE,
  action: Action
): WalletsState => {
  switch (action.type) {
    //
    // delete all payments method by function
    //
    case getType(optInPaymentMethodsStart):
      // Reset the state when the opt-in payment methods workunit starts
      return {
        ...state,
        deleteAllByFunction: WALLETS_INITIAL_STATE.deleteAllByFunction
      };
    case getType(deleteAllPaymentMethodsByFunction.request):
      return { ...state, deleteAllByFunction: remoteLoading };
    case getType(deleteAllPaymentMethodsByFunction.success):
      return {
        ...state,
        walletById: pot.some(
          toIndexed(action.payload.wallets, _ => _.idWallet)
        ),
        deleteAllByFunction: remoteReady({
          deletedMethodsCount: action.payload.deletedMethodsCount
        })
      };
    case getType(deleteAllPaymentMethodsByFunction.failure):
      return { ...state, deleteAllByFunction: remoteError(action.payload) };
    //
    // fetch wallets
    //
    case getType(fetchWalletsRequestWithExpBackoff):
    case getType(fetchWalletsRequest):
    case getType(paymentUpdateWalletPsp.request):
    case getType(updatePaymentStatus.request):
    case getType(deleteWalletRequest):
      return {
        ...state,
        walletById: pot.toLoading(state.walletById)
      };

    case getType(updatePaymentStatus.success):
      const currentWallets = pot.getOrElse(state.walletById, {});
      // update the received wallet
      return {
        ...state,
        walletById: pot.some({
          ...currentWallets,
          [action.payload.idWallet]: action.payload
        })
      };
    case getType(fetchWalletsSuccess):
    case getType(paymentUpdateWalletPsp.success):
    case getType(deleteWalletSuccess):
      const wallets = isOfType(getType(paymentUpdateWalletPsp.success), action)
        ? action.payload.wallets
        : action.payload;
      return {
        ...state,
        walletById: pot.some(toIndexed(wallets, _ => _.idWallet))
      };

    case getType(fetchWalletsFailure):
    case getType(deleteWalletFailure):
    case getType(paymentUpdateWalletPsp.failure):
      return {
        ...state,
        walletById: pot.toError(state.walletById, action.payload)
      };
    case getType(updatePaymentStatus.failure):
      return {
        ...state,
        walletById: pot.toError(
          state.walletById,
          getErrorFromNetworkError(action.payload)
        )
      };

    //
    // set favourite wallet
    //
    case getType(setFavouriteWalletRequest):
      return {
        ...state,
        updatingFavouriteWallet: pot.toUpdating(
          state.updatingFavouriteWallet,
          action.payload
        )
      };
    case getType(setFavouriteWalletFailure):
      return {
        ...state,
        updatingFavouriteWallet: pot.toError(
          state.updatingFavouriteWallet,
          action.payload
        )
      };
    case getType(setFavouriteWalletSuccess):
      // On success, we update both the favourite wallet ID and the
      // corresponding Wallet in walletById.
      return {
        ...state,
        updatingFavouriteWallet: pot.some(action.payload.idWallet),
        walletById: pot.map(state.walletById, walletsById =>
          _.keys(walletsById).reduce<IndexedById<Wallet>>(
            (acc, val) =>
              ({
                ...acc,
                [val]: {
                  ...walletsById[val],
                  favourite:
                    action.payload.idWallet === walletsById[val]?.idWallet
                }
              } as IndexedById<Wallet>),
            {}
          )
        )
      };

    //
    // add credit card
    //

    case getType(addWalletCreditCardInit):
      return {
        ...state,
        creditCardAddWallet: pot.none
      };

    case getType(addWalletCreditCardWithBackoffRetryRequest):
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
    case getType(sessionExpired):
    case getType(sessionInvalid):
    case getType(clearCache):
      return {
        ...state,
        walletById: WALLETS_INITIAL_STATE.walletById
      };

    default:
      return state;
  }
};

export default reducer;
