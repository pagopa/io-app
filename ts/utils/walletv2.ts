/**
 * Return true if function is enabled for the wallet (aka payment method)
 * @param wallet
 */
import {
  EnableableFunctionsTypeEnum,
  PatchedWalletV2,
  Wallet
} from "../types/pagopa";
import { TypeEnum as WalletTypeEnumV1 } from "../../definitions/pagopa/Wallet";
import { WalletTypeEnum } from "../../definitions/pagopa/walletv2/WalletV2";
import {
  CreditCardExpirationMonth,
  CreditCardExpirationYear,
  CreditCardPan
} from "./input";

/**
 * true if the given wallet support the given walletFunction
 * @param wallet
 * @param walletFunction
 */
export const hasFunctionEnabled = (
  wallet: PatchedWalletV2,
  walletFunction: EnableableFunctionsTypeEnum
) => wallet.enableableFunctions.includes(walletFunction);

/**
 * inject walletV2 into walletV1 structure
 * @param walletV2
 */
export const convertWalletV2toWalletV1 = (
  walletV2: PatchedWalletV2
): Wallet => {
  const info = walletV2.info;
  return {
    idWallet: walletV2.idWallet,
    type:
      walletV2.walletType === WalletTypeEnum.Card
        ? WalletTypeEnumV1.CREDIT_CARD
        : WalletTypeEnumV1.EXTERNAL_PS,
    favourite: walletV2.favourite,
    creditCard: {
      id: undefined,
      holder: info.holder ?? "",
      pan: info.blurredNumber as CreditCardPan,
      expireMonth: info.expireMonth as CreditCardExpirationMonth,
      expireYear: info.expireYear as CreditCardExpirationYear,
      brandLogo: info.brandLogo,
      flag3dsVerified: true,
      brand: info.brand,
      onUs: true,
      securityCode: undefined
    },
    psp: undefined,
    idPsp: undefined,
    pspEditable: false,
    lastUsage: walletV2.updateDate ? new Date(walletV2.updateDate) : undefined,
    isPspToIgnore: false,
    registeredNexi: false,
    saved: true,
    v2: walletV2
  };
};
