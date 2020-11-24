import { fromNullable } from "fp-ts/lib/Option";
import {
  isRawBancomat,
  isRawBPay,
  isRawCreditCard,
  isRawSatispay,
  RawBancomatPaymentMethod,
  RawCreditCardPaymentMethod,
  RawPaymentMethod
} from "../types/pagopa";
import {
  cardIcons,
  getCardIconFromBrandLogo
} from "../components/wallet/card/Logo";
import pagoBancomatImage from "../../img/wallet/cards-icons/pagobancomat.png";
import { IndexedById } from "../store/helpers/indexer";
import { Abi } from "../../definitions/pagopa/walletv2/Abi";
import I18n from "../i18n";
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
  return FOUR_UNICODE_CIRCLES;
};
