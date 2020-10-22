import * as t from "io-ts";
import { Alert } from "react-native";
import I18n from "../i18n";
import { CreditCard, PatchedWalletV2, Wallet } from "../types/pagopa";
import { TypeEnum } from "../../definitions/pagopa/Wallet";
import { isExpired } from "./dates";
import { NumberFromString } from "./number";
import {
  CreditCardExpirationMonth,
  CreditCardExpirationYear,
  CreditCardPan
} from "./input";
/*
    Contains utility functions to check conditions
    used across project (currently just in CardComponent)
 */

export const isExpiredCard = (creditCard: CreditCard) => {
  const decodedValueYear = NumberFromString.decode(creditCard.expireYear);
  const ccExpireYear = decodedValueYear.isRight()
    ? decodedValueYear.value
    : undefined;
  const decodedValueMonth = NumberFromString.decode(creditCard.expireMonth);
  const ccExpireMonth = decodedValueMonth.isRight()
    ? decodedValueMonth.value
    : undefined;
  // if we can't decode month or year value, card will be considered as expired
  if (ccExpireYear === undefined || ccExpireMonth === undefined) {
    return true;
  }
  return isExpired(ccExpireMonth, ccExpireYear);
};

/**
 * it sanitizes psp tags avoiding no string value and string duplicates
 * @param w wallet object
 */
export const fixWalletPspTagsValues = (w: unknown) => {
  const decoder = t.interface({
    psp: t.interface({
      tags: t.readonlyArray(t.unknown)
    })
  });
  const decoded = decoder.decode(w);
  if (decoded.isLeft()) {
    return w;
  }
  const psp = decoded.value.psp;
  const tags = decoded.value.psp.tags;
  return {
    ...decoded.value,
    psp: {
      ...psp,
      tags: tags.filter(
        (item: any, idx: number) =>
          typeof item === "string" && tags.indexOf(item) === idx
      )
    }
  };
};

/**
 * This function handles the set favourite method on wallet section:
 * - if it is already a favourite it displays an alert suggesting to select another favourite method
 * - if it is not a favourite the callback will be executed
 * more information at https://www.pivotaltracker.com/story/show/172762258
 * @param willBeFavorite defines if the method will be the favourite selected by the user
 * @param callback method to invoke for saving the method
 */
export const handleSetFavourite = (
  willBeFavorite: boolean,
  callback: () => void
) =>
  willBeFavorite
    ? callback()
    : Alert.alert(
        I18n.t("global.genericAlert"),
        I18n.t("wallet.alert.favourite")
      );

export const convertWalletV2toWalletV1 = (
  walletV2: PatchedWalletV2
): Wallet => {
  const info = walletV2.info;
  return {
    idWallet: walletV2.idWallet,
    type: TypeEnum.CREDIT_CARD,
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
