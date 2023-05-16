/**
 * Return true if function is enabled for the wallet (aka payment method)
 * @param wallet
 */
import * as O from "fp-ts/lib/Option";
import { pipe } from "fp-ts/lib/function";
import { TypeEnum as WalletTypeEnumV1 } from "../../definitions/pagopa/Wallet";
import { CardInfo, TypeEnum } from "../../definitions/pagopa/walletv2/CardInfo";
import { SatispayInfo } from "../../definitions/pagopa/walletv2/SatispayInfo";
import { WalletTypeEnum } from "../../definitions/pagopa/WalletV2";
import {
  PatchedPaymentMethodInfo,
  PatchedWalletV2,
  RawBPayPaymentMethod,
  RawPaymentMethod,
  RawSatispayPaymentMethod,
  Wallet
} from "../types/pagopa";
import { EnableableFunctions } from "../../definitions/pagopa/EnableableFunctions";
import { PayPalInfo } from "../../definitions/pagopa/PayPalInfo";
import {
  CreditCardExpirationMonth,
  CreditCardExpirationYear,
  CreditCardPan
} from "./input";

/**
 * true if the given paymentMethod supports the given walletFunction
 * @param paymentMethod
 * @param walletFunction
 */
export const hasFunctionEnabled = (
  paymentMethod: RawPaymentMethod | undefined,
  walletFunction: EnableableFunctions
): boolean =>
  paymentMethod !== undefined &&
  paymentMethod.enableableFunctions.includes(walletFunction);

// check if a PatchedWalletV2 has BPay as paymentInfo
const isWalletV2BPay = (
  wallet: PatchedWalletV2,
  paymentMethodInfo: PatchedPaymentMethodInfo
): paymentMethodInfo is CardInfo =>
  (paymentMethodInfo && wallet.walletType === WalletTypeEnum.BPay) ||
  wallet.walletType === WalletTypeEnum.BPay;

// check if a PatchedWalletV2 has Satispay as paymentInfo
const isWalletV2Satispay = (
  wallet: PatchedWalletV2,
  paymentMethodInfo: PatchedPaymentMethodInfo
): paymentMethodInfo is SatispayInfo =>
  paymentMethodInfo && wallet.walletType === WalletTypeEnum.Satispay;

// check if a PatchedWalletV2 has Paypal as paymentInfo
const isWalletV2PayPal = (
  wallet: PatchedWalletV2,
  paymentMethodInfo: PatchedPaymentMethodInfo
): paymentMethodInfo is PayPalInfo =>
  paymentMethodInfo && wallet.walletType === WalletTypeEnum.PayPal;

// check if a PatchedWalletV2 has Bancomat as paymentInfo
const isWalletV2Bancomat = (
  wallet: PatchedWalletV2,
  paymentMethodInfo: PatchedPaymentMethodInfo
): paymentMethodInfo is CardInfo =>
  paymentMethodInfo && wallet.walletType === WalletTypeEnum.Bancomat;

// check if a PatchedWalletV2 has CreditCard  as paymentInfo
const isWalletV2CreditCard = (
  wallet: PatchedWalletV2,
  paymentMethodInfo: PatchedPaymentMethodInfo
): paymentMethodInfo is CardInfo =>
  paymentMethodInfo && wallet.walletType === WalletTypeEnum.Card;

export const fromPatchedWalletV2ToRawPaymentMethod = (
  wallet: PatchedWalletV2
): RawPaymentMethod | undefined => {
  if (
    isWalletV2CreditCard(wallet, wallet.info) &&
    wallet.info.type !== TypeEnum.PRV
  ) {
    return { ...wallet, kind: "CreditCard", info: wallet.info };
  }
  if (isWalletV2Bancomat(wallet, wallet.info)) {
    return { ...wallet, kind: "Bancomat", info: wallet.info };
  }
  if (isWalletV2Satispay(wallet, wallet.info)) {
    return { ...wallet, kind: "Satispay", info: wallet.info };
  }
  if (isWalletV2BPay(wallet, wallet.info)) {
    return { ...wallet, kind: "BPay", info: wallet.info };
  }
  if (isWalletV2PayPal(wallet, wallet.info)) {
    return { ...wallet, kind: "PayPal", info: wallet.info };
  }
  return undefined;
};

// TODO: should be Either instead of return undefined
export const fromPatchedWalletV2ToRawSatispay = (
  wallet: PatchedWalletV2
): RawSatispayPaymentMethod | undefined => {
  if (isWalletV2Satispay(wallet, wallet.info)) {
    return { ...wallet, kind: "Satispay", info: wallet.info };
  }
  return undefined;
};

// if some, the value will be a RawBPayPaymentMethod
export const fromPatchedWalletV2ToRawBPay = (
  wallet: PatchedWalletV2
): O.Option<RawBPayPaymentMethod> =>
  pipe(
    O.fromPredicate((wallet: PatchedWalletV2) =>
      isWalletV2BPay(wallet, wallet.info)
    )(wallet),
    O.map(w => ({ ...w, kind: "BPay", info: wallet.info }))
  );

/**
 * inject walletV2 into walletV1 structure
 * @param walletV2
 */
export const convertWalletV2toWalletV1 = (
  walletV2: PatchedWalletV2
): Wallet => {
  const paymentMethodInfo = fromPatchedWalletV2ToRawPaymentMethod(walletV2);
  const card =
    paymentMethodInfo?.kind === "CreditCard"
      ? paymentMethodInfo.info
      : undefined;
  // if the payment method is a credit card
  // fill the creditCard field of Wallet
  const cc = card
    ? {
        id: undefined,
        holder: card.holder ?? "",
        pan: card.blurredNumber as CreditCardPan,
        expireMonth: card.expireMonth as CreditCardExpirationMonth,
        expireYear: card.expireYear as CreditCardExpirationYear,
        brandLogo: card.brandLogo,
        flag3dsVerified: true,
        brand: card.brand,
        onUs: true,
        securityCode: undefined
      }
    : undefined;

  return {
    idWallet: walletV2.idWallet,
    type:
      walletV2.walletType === WalletTypeEnum.Card
        ? WalletTypeEnumV1.CREDIT_CARD
        : WalletTypeEnumV1.EXTERNAL_PS,
    favourite: walletV2.favourite,
    creditCard: cc,
    psp: undefined,
    idPsp: undefined,
    pspEditable: false,
    lastUsage: walletV2.updateDate ? new Date(walletV2.updateDate) : undefined,
    isPspToIgnore: false,
    registeredNexi: false,
    saved: true,
    paymentMethod: fromPatchedWalletV2ToRawPaymentMethod(walletV2)
  };
};
