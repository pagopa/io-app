/**
 * Reducers, states, selectors and guards for the cards
 */
import { fromNullable } from "fp-ts/lib/Option";
import * as pot from "italia-ts-commons/lib/pot";
import { values } from "lodash";
import { ImageSourcePropType } from "react-native";
import { createSelector } from "reselect";
import { getType, isOfType } from "typesafe-actions";
import { Abi } from "../../../../definitions/pagopa/walletv2/Abi";
import { WalletTypeEnum } from "../../../../definitions/pagopa/walletv2/WalletV2";
import pagoBancomatImage from "../../../../img/wallet/cards-icons/pagobancomat.png";
import {
  cardIcons,
  getCardIconFromBrandLogo
} from "../../../components/wallet/card/Logo";
import { abiSelector } from "../../../features/wallet/onboarding/store/abi";
import I18n from "../../../i18n";
import {
  BancomatPaymentMethod,
  CreditCardPaymentMethod,
  isBancomat,
  isBPay,
  isCreditCard,
  isSatispay,
  PaymentMethod,
  Wallet
} from "../../../types/pagopa";

import { PotFromActions } from "../../../types/utils";
import { isDefined } from "../../../utils/guards";
import { Action } from "../../actions/types";
import { paymentUpdateWalletPsp } from "../../actions/wallet/payment";
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
import { getValueOrElse } from "../../../features/bonus/bpd/model/RemoteValue";

export type WalletsState = Readonly<{
  walletById: PotFromActions<IndexedById<Wallet>, typeof fetchWalletsFailure>;
  favoriteWalletId: pot.Pot<Wallet["idWallet"], string>;
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

/**
 * @deprecated Using API v2 this selector is deprecated
 * If you are searching for credit card or bancomat use {@link creditCardWalletV1Selector}
 * - {@link pagoPaCreditCardWalletV1Selector} {@link bancomatSelector} instead
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

type PaymentMethodRepresentation = {
  caption: string;
  icon: ImageSourcePropType;
};

export type EnhancedPaymentMethod =
  | EnhancedBancomat
  | (PaymentMethod & PaymentMethodRepresentation);

/**
 * Choose an image to represent a {@link PaymentMethod}
 * @param paymentMethod
 */
const getImageFromPaymentMethod = (paymentMethod: PaymentMethod) => {
  if (isCreditCard(paymentMethod)) {
    return getCardIconFromBrandLogo(paymentMethod.info);
  }
  if (isBancomat(paymentMethod)) {
    return pagoBancomatImage;
  }
  return cardIcons.UNKNOWN;
};

// TODO: unify card representation (multiple part of the application use this)
const FOUR_UNICODE_CIRCLES = "●".repeat(4);

/**
 * Choose a textual representation for a {@link PatchedWalletV2}
 * @param paymentMethod
 * @param abiList
 */
const getTitleFromPaymentMethod = (
  paymentMethod: PaymentMethod,
  abiList: IndexedById<Abi>
) => {
  if (isCreditCard(paymentMethod)) {
    return getTitleFromCard(paymentMethod);
  }
  if (isBancomat(paymentMethod)) {
    return getTitleFromBancomat(paymentMethod, abiList);
  }
  return FOUR_UNICODE_CIRCLES;
};

export const getTitleFromCard = (creditCard: CreditCardPaymentMethod) =>
  `${FOUR_UNICODE_CIRCLES} ${creditCard.info.blurredNumber}`;

const getTitleFromBancomat = (
  bancomatInfo: BancomatPaymentMethod,
  abiList: IndexedById<Abi>
) =>
  fromNullable(bancomatInfo.info.issuerAbiCode)
    .chain(abiCode => fromNullable(abiList[abiCode]))
    .chain(abi => fromNullable(abi.name))
    .getOrElse(I18n.t("wallet.methods.bancomat.name"));

export const enhanceBancomat = (
  bancomat: BancomatPaymentMethod,
  abiList: IndexedById<Abi>
): EnhancedBancomat => ({
  ...bancomat,
  abiInfo: bancomat.info.issuerAbiCode
    ? abiList[bancomat.info.issuerAbiCode]
    : undefined,
  caption: getTitleFromBancomat(bancomat, abiList),
  icon: getImageFromPaymentMethod(bancomat)
});

export const enhancePaymentMethod = (
  pm: PaymentMethod,
  abiList: IndexedById<Abi>
): EnhancedPaymentMethod => {
  switch (pm.kind) {
    // bancomat need a special handling, we need to reconciliate the abi
    case "Bancomat":
      return enhanceBancomat(pm, abiList);
    case "CreditCard":
    case "BPay":
    case "Satispay":
      return {
        ...pm,
        caption: getTitleFromPaymentMethod(pm, abiList),
        icon: getImageFromPaymentMethod(pm)
      };
  }
};

/**
 * Get a list of the payment methods in the wallet
 */
export const paymentMethodsSelector = createSelector(
  [walletsSelector, abiSelector],
  (
    potWallet,
    remoteAbi
  ): pot.Pot<ReadonlyArray<EnhancedPaymentMethod>, Error> =>
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

export type EnhancedBancomat = BancomatPaymentMethod &
  PaymentMethodRepresentation & {
    abiInfo?: Abi;
  };

export const getPaymentMethodHash = (pm: PaymentMethod): string | undefined => {
  if (isBancomat(pm)) {
    return pm.info.hashPan;
  }
  if (isCreditCard(pm)) {
    return pm.info.hashPan;
  }
  if (isSatispay(pm)) {
    return pm.info.uuid;
  }
  if (isBPay(pm)) {
    return pm.info.uidHash;
  }
  return undefined;
};

const isEnhancedBancomat = (
  epm: EnhancedPaymentMethod
): epm is EnhancedBancomat => epm.kind === "Bancomat";

/**
 * Return a bancomat list enhanced with the additional abi information
 */
export const bancomatSelector = createSelector(
  [paymentMethodsSelector],
  (paymentMethodPot): pot.Pot<ReadonlyArray<EnhancedBancomat>, Error> =>
    pot.map(paymentMethodPot, paymentMethod =>
      paymentMethod.filter(isEnhancedBancomat)
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

export const creditCardSelector = createSelector(
  [paymentMethodsSelector],
  (
    paymentMethods: pot.Pot<ReadonlyArray<PaymentMethod>, Error>
  ): ReadonlyArray<CreditCardPaymentMethod> =>
    pot.getOrElse(
      pot.map(paymentMethods, w => w.filter(isCreditCard)),
      []
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

// reducer
// eslint-disable-next-line complexity
const reducer = (
  state: WalletsState = WALLETS_INITIAL_STATE,
  action: Action
): WalletsState => {
  switch (action.type) {
    //
    // fetch wallets
    //

    case getType(fetchWalletsRequest):
    case getType(paymentUpdateWalletPsp.request):
    case getType(deleteWalletRequest):
      return {
        ...state,
        favoriteWalletId: pot.toLoading(state.favoriteWalletId),
        walletById: pot.toLoading(state.walletById)
      };

    case getType(fetchWalletsSuccess):
    case getType(paymentUpdateWalletPsp.success):
    case getType(deleteWalletSuccess):
      const wallets = isOfType(getType(paymentUpdateWalletPsp.success), action)
        ? action.payload.wallets
        : action.payload;
      const favouriteWallet = wallets.find(_ => _.favourite === true);
      const newState = {
        ...state,
        walletById: pot.some(toIndexed(wallets, _ => _.idWallet))
      };
      return {
        ...newState,
        favoriteWalletId:
          favouriteWallet !== undefined
            ? pot.some(favouriteWallet.idWallet)
            : pot.none
      };

    case getType(fetchWalletsFailure):
    case getType(deleteWalletFailure):
    case getType(paymentUpdateWalletPsp.failure):
      return {
        ...state,
        favoriteWalletId: pot.toError(
          state.favoriteWalletId,
          action.payload.message
        ),
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
        favoriteWalletId: pot.toError(
          state.favoriteWalletId,
          action.payload.message
        )
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
      const urlWithToken = `${action.payload.urlCheckout3ds}&sessionToken=${action.payload.paymentManagerToken}`;

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
