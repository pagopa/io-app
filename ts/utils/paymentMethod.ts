import { fromNullable } from "fp-ts/lib/Option";
import { ImageSourcePropType } from "react-native";
import { Abi } from "../../definitions/pagopa/walletv2/Abi";
import bPayImage from "../../img/wallet/cards-icons/bPay.png";
import satispayImage from "../../img/wallet/cards-icons/satispay.png";
import pagoBancomatImage from "../../img/wallet/cards-icons/pagobancomat.png";
import {
  cardIcons,
  getCardIconFromBrandLogo
} from "../components/wallet/card/Logo";
import I18n from "../i18n";
import { IndexedById } from "../store/helpers/indexer";
import {
  BancomatPaymentMethod,
  BPayPaymentMethod,
  isRawBancomat,
  isRawBPay,
  isRawCreditCard,
  isRawSatispay,
  PaymentMethod,
  RawBancomatPaymentMethod,
  RawBPayPaymentMethod,
  RawCreditCardPaymentMethod,
  RawPaymentMethod,
  RawSatispayPaymentMethod,
  SatispayPaymentMethod
} from "../types/pagopa";
import { contentRepoUrl } from "../config";
import {
  Card,
  ValidityStateEnum
} from "../../definitions/pagopa/walletv2/Card";
import { FOUR_UNICODE_CIRCLES } from "./wallet";

export const getPaymentMethodHash = (
  pm: RawPaymentMethod
): string | undefined => {
  if (isRawBancomat(pm)) {
    return pm.info.hashPan;
  }
  if (isRawCreditCard(pm)) {
    return pm.info.hashPan;
  }
  if (isRawSatispay(pm)) {
    return pm.info.uuid;
  }
  if (isRawBPay(pm)) {
    return pm.info.uidHash;
  }
  return undefined;
};

export const getTitleFromCard = (creditCard: RawCreditCardPaymentMethod) =>
  `${FOUR_UNICODE_CIRCLES} ${creditCard.info.blurredNumber}`;

export const getBancomatAbiIconUrl = (abi: string) =>
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
  if (isRawBPay(paymentMethod)) {
    return bPayImage;
  }
  return cardIcons.UNKNOWN;
};

export const getTitleFromBancomat = (
  bancomatInfo: RawBancomatPaymentMethod,
  abiList: IndexedById<Abi>
) =>
  fromNullable(bancomatInfo.info.issuerAbiCode)
    .chain(abiCode => fromNullable(abiList[abiCode]))
    .chain(abi => fromNullable(abi.name))
    .getOrElse(I18n.t("wallet.methods.bancomat.name"));

export const getTitleForSatispay = () => I18n.t("wallet.methods.satispay.name");

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
      fromNullable(paymentMethod.info.instituteCode)
        .chain(abiCode => fromNullable(abiList[abiCode]))
        .chain(abi => fromNullable(abi.name))
        .toUndefined() ??
      paymentMethod.info.bankName ??
      I18n.t("wallet.methods.bancomatPay.name")
    );
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
    numberObfuscated: rawBPay.info.numberObfuscated?.replace(/\*/g, "●")
  },
  abiInfo: rawBPay.info.instituteCode
    ? abiList[rawBPay.info.instituteCode]
    : undefined,
  caption: getTitleFromPaymentMethod(rawBPay, abiList),
  icon: getImageFromPaymentMethod(rawBPay)
});

export const enhancePaymentMethod = (
  pm: RawPaymentMethod,
  abiList: IndexedById<Abi>
): PaymentMethod => {
  switch (pm.kind) {
    // bancomat need a special handling, we need to include the abi
    case "Bancomat":
      return enhanceBancomat(pm, abiList);
    case "BPay":
      return enhanceBPay(pm, abiList);
    case "CreditCard":
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
