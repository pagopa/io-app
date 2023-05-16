import * as E from "fp-ts/lib/Either";
import * as O from "fp-ts/lib/Option";
import { pipe } from "fp-ts/lib/function";
import { Alert, ImageSourcePropType } from "react-native";
import { Abi } from "../../definitions/pagopa/walletv2/Abi";
import {
  Card,
  ValidityStateEnum
} from "../../definitions/pagopa/walletv2/Card";
import {
  PaymentInstrument,
  ValidityStatusEnum
} from "../../definitions/pagopa/walletv2/PaymentInstrument";
import bPayImage from "../../img/wallet/cards-icons/bPay.png";
import pagoBancomatImage from "../../img/wallet/cards-icons/pagobancomat.png";
import paypalImage from "../../img/wallet/cards-icons/paypal.png";
import satispayImage from "../../img/wallet/cards-icons/satispay.png";
import {
  cardIcons,
  getCardIconFromBrandLogo
} from "../components/wallet/card/Logo";
import { contentRepoUrl } from "../config";
import I18n from "../i18n";
import { mixpanelTrack } from "../mixpanel";
import { IndexedById } from "../store/helpers/indexer";
import {
  BPayPaymentMethod,
  BancomatPaymentMethod,
  CreditCardPaymentMethod,
  PaymentMethod,
  RawBPayPaymentMethod,
  RawBancomatPaymentMethod,
  RawCreditCardPaymentMethod,
  RawPayPalPaymentMethod,
  RawPaymentMethod,
  RawSatispayPaymentMethod,
  SatispayPaymentMethod,
  isRawBPay,
  isRawBancomat,
  isRawCreditCard,
  isRawPayPal,
  isRawSatispay
} from "../types/pagopa";
import { isExpired } from "./dates";
import { getPaypalAccountEmail } from "./paypal";
import { FOUR_UNICODE_CIRCLES } from "./wallet";

export const getPaymentMethodHash = (
  pm: RawPaymentMethod
): string | undefined => {
  switch (pm.kind) {
    case "Satispay":
      return pm.info.uuid;
    case "PayPal":
      return getPaypalAccountEmail(pm.info);
    case "BPay":
      return pm.info.uidHash;
    case "Bancomat":
    case "CreditCard":
      return pm.info.hashPan;
    case "Privative":
      return undefined;
  }
};
export const getTitleFromPaymentInstrument = (
  paymentInstrument: PaymentInstrument
) => `${FOUR_UNICODE_CIRCLES} ${paymentInstrument.panPartialNumber ?? ""}`;

export const getTitleFromCard = (creditCard: RawCreditCardPaymentMethod) =>
  `${FOUR_UNICODE_CIRCLES} ${creditCard.info.blurredNumber ?? ""}`;

export const getBancomatAbiIconUrl = (abi: string) =>
  `${contentRepoUrl}/logos/abi/${abi}.png`;

export const getPspIconUrlFromAbi = (abi: string) =>
  `${contentRepoUrl}/logos/abi/${abi}.png`;

/**
 * Choose an image to represent a {@link RawPaymentMethod}
 * @param paymentMethod
 */
export const getImageFromPaymentMethod = (
  paymentMethod: RawPaymentMethod
): ImageSourcePropType => {
  if (isRawCreditCard(paymentMethod)) {
    return getCardIconFromBrandLogo(paymentMethod.info);
  }
  if (isRawBancomat(paymentMethod)) {
    return pagoBancomatImage;
  }
  if (isRawSatispay(paymentMethod)) {
    return satispayImage;
  }
  if (isRawPayPal(paymentMethod)) {
    return paypalImage;
  }
  if (isRawBPay(paymentMethod)) {
    return bPayImage;
  }
  return cardIcons.UNKNOWN;
};

export const getTitleFromBancomat = (
  bancomatInfo: RawBancomatPaymentMethod,
  abiList: IndexedById<Abi>
) =>
  pipe(
    bancomatInfo.info.issuerAbiCode,
    O.fromNullable,
    O.chain(abiCode => O.fromNullable(abiList[abiCode])),
    O.chain(abi => O.fromNullable(abi.name)),
    O.getOrElse(() => I18n.t("wallet.methods.bancomat.name"))
  );

const getTitleForSatispay = () => I18n.t("wallet.methods.satispay.name");
const getTitleForPaypal = (paypal: RawPayPalPaymentMethod) =>
  getPaypalAccountEmail(paypal.info);
/**
 * Choose a textual representation for a {@link PatchedWalletV2}
 * @param paymentMethod
 * @param abiList
 */
export const getTitleFromPaymentMethod = (
  paymentMethod: RawPaymentMethod,
  abiList: IndexedById<Abi>
) => {
  if (isRawCreditCard(paymentMethod)) {
    return getTitleFromCard(paymentMethod);
  }
  if (isRawBancomat(paymentMethod)) {
    return getTitleFromBancomat(paymentMethod, abiList);
  }
  if (isRawSatispay(paymentMethod)) {
    return getTitleForSatispay();
  }
  if (isRawBPay(paymentMethod)) {
    return (
      pipe(
        paymentMethod.info.instituteCode,
        O.fromNullable,
        O.chain(abiCode => O.fromNullable(abiList[abiCode])),
        O.chain(abi => O.fromNullable(abi.name)),
        O.toUndefined
      ) ??
      paymentMethod.info.bankName ??
      I18n.t("wallet.methods.bancomatPay.name")
    );
  }
  if (isRawPayPal(paymentMethod)) {
    return getTitleForPaypal(paymentMethod);
  }
  return FOUR_UNICODE_CIRCLES;
};

export const enhanceBancomat = (
  bancomat: RawBancomatPaymentMethod,
  abiList: IndexedById<Abi>
): BancomatPaymentMethod => ({
  ...bancomat,
  abiInfo: bancomat.info.issuerAbiCode
    ? abiList[bancomat.info.issuerAbiCode]
    : undefined,
  caption: getTitleFromBancomat(bancomat, abiList),
  icon: getImageFromPaymentMethod(bancomat)
});

export const enhanceSatispay = (
  raw: RawSatispayPaymentMethod
): SatispayPaymentMethod => ({
  ...raw,
  caption: getTitleForSatispay(),
  icon: getImageFromPaymentMethod(raw)
});

export const enhanceBPay = (
  rawBPay: RawBPayPaymentMethod,
  abiList: IndexedById<Abi>
): BPayPaymentMethod => ({
  ...rawBPay,
  info: {
    ...rawBPay.info,
    numberObfuscated: `${rawBPay.info.numberObfuscated?.replace(/\*+/g, "●●●")}`
  },
  abiInfo: rawBPay.info.instituteCode
    ? abiList[rawBPay.info.instituteCode]
    : undefined,
  caption: I18n.t("wallet.methods.bancomatPay.name"),
  icon: getImageFromPaymentMethod(rawBPay)
});

export const enhanceCreditCard = (
  rawCreditCard: RawCreditCardPaymentMethod,
  abiList: IndexedById<Abi>
): CreditCardPaymentMethod => ({
  ...rawCreditCard,
  abiInfo: rawCreditCard.info.issuerAbiCode
    ? abiList[rawCreditCard.info.issuerAbiCode]
    : undefined,
  caption: getTitleFromPaymentMethod(rawCreditCard, abiList),
  icon: getImageFromPaymentMethod(rawCreditCard)
});

export const enhancePaymentMethod = (
  pm: RawPaymentMethod,
  abiList: IndexedById<Abi>
): PaymentMethod | null => {
  switch (pm.kind) {
    // bancomat need a special handling, we need to include the abi
    case "Bancomat":
      return enhanceBancomat(pm, abiList);
    case "BPay":
      return enhanceBPay(pm, abiList);
    case "CreditCard":
      return enhanceCreditCard(pm, abiList);
    case "Privative":
      return null;
    case "PayPal":
    case "Satispay":
      return {
        ...pm,
        caption: getTitleFromPaymentMethod(pm, abiList),
        icon: getImageFromPaymentMethod(pm)
      };
  }
};

export const isBancomatBlocked = (pan: Card) =>
  pan.validityState === ValidityStateEnum.BR;

export const isCoBadgeBlocked = (pan: PaymentInstrument) =>
  pan.validityStatus === ValidityStatusEnum.BLOCK_REVERSIBLE;

/**
 * Check if the given payment method is expired
 * right(true) if it is expired, right(false) if it is still valid
 * left if expiring date can't be evaluated
 * @param paymentMethod
 */
export const isPaymentMethodExpired = (
  paymentMethod: RawPaymentMethod
): E.Either<Error, boolean> => {
  switch (paymentMethod.kind) {
    case "BPay":
    case "PayPal":
    case "Satispay":
      return E.right(false);
    case "Bancomat":
    case "CreditCard":
      return isExpired(
        paymentMethod.info.expireMonth,
        paymentMethod.info.expireYear
      );
    case "Privative":
      return E.left(new Error("privative methods are deprecated"));
  }
};

// inform the user he/she has no payment methods to pay
export const alertNoPayablePaymentMethods = (
  onContinue: () => void,
  onCancel?: () => void
) => {
  void mixpanelTrack("NO_PAYABLE_METHODS");
  Alert.alert(
    I18n.t("payment.alertNoPaymentMethods.title"),
    I18n.t("payment.alertNoPaymentMethods.message"),
    [
      {
        text: I18n.t("payment.alertNoPaymentMethods.buttons.ko"),
        onPress: onCancel
      },
      {
        text: I18n.t("payment.alertNoPaymentMethods.buttons.ok"),
        onPress: onContinue
      }
    ]
  );
};

// inform the user he/she has some payable payment methods but not one of them is active
export const alertNoActivePayablePaymentMethods = (
  onContinue: () => void,
  onCancel?: () => void
) => {
  void mixpanelTrack("NO_ACTIVE_PAYABLE_METHODS");
  Alert.alert(
    I18n.t("payment.alertNoActivePaymentMethods.title"),
    I18n.t("payment.alertNoActivePaymentMethods.message"),
    [
      {
        text: I18n.t("payment.alertNoActivePaymentMethods.buttons.ko"),
        onPress: onCancel
      },
      {
        text: I18n.t("payment.alertNoActivePaymentMethods.buttons.ok"),
        onPress: onContinue
      }
    ]
  );
};
