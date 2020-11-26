import { fromNullable } from "fp-ts/lib/Option";
import { Abi } from "../../definitions/pagopa/walletv2/Abi";
import bPayImage from "../../img/wallet/cards-icons/bPay.png";
import pagoBancomatImage from "../../img/wallet/cards-icons/pagobancomat.png";
import satispayImage from "../../img/wallet/cards-icons/satispay.png";
import {
  cardIcons,
  getCardIconFromBrandLogo
} from "../components/wallet/card/Logo";
import I18n from "../i18n";
import { IndexedById } from "../store/helpers/indexer";
import {
  BancomatPaymentMethod,
  isRawBancomat,
  isRawBPay,
  isRawCreditCard,
  isRawSatispay,
  PaymentMethod,
  RawBancomatPaymentMethod,
  RawCreditCardPaymentMethod,
  RawPaymentMethod
} from "../types/pagopa";
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

/**
 * Choose an image to represent a {@link RawPaymentMethod}
 * @param paymentMethod
 */
export const getImageFromPaymentMethod = (paymentMethod: RawPaymentMethod) => {
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
    return I18n.t("wallet.methods.satispay.name");
  }
  if (isRawBPay(paymentMethod)) {
    return (
      paymentMethod.info.numberObfuscated?.replace(/\*/g, "●") ??
      paymentMethod.info.bankName ??
      FOUR_UNICODE_CIRCLES
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

export const enhancePaymentMethod = (
  pm: RawPaymentMethod,
  abiList: IndexedById<Abi>
): PaymentMethod => {
  switch (pm.kind) {
    // bancomat need a special handling, we need to include the abi
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
