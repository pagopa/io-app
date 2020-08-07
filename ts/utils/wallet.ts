import { fromPredicate } from "fp-ts/lib/Option";
import * as t from "io-ts";
import { Alert } from "react-native";
import I18n from "../i18n";
import { CreditCard } from "../types/pagopa";
import { isExpired } from "./dates";
import { NumberFromString } from "./number";
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
 * - if it is already a favourite it displays an alert for the user suggesting to select another favourite method
 * - if it is not a favourite it saves it as one
 * more informations at https://www.pivotaltracker.com/story/show/172762258
 * @param willBeFavorite defines if the method will  be the favourite selected by the user
 * @param callback callback method to invoke for saving the method
 */
export const handleSetFavourite = (
  willBeFavorite: boolean,
  callback: () => void
) =>
  fromPredicate(wbf => wbf === true)(willBeFavorite).foldL(
    () => Alert.alert(I18n.t("wallet.alert.favourite")),
    () => callback()
  );
