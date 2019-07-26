import * as t from "io-ts";
import { CreditCard } from "../types/pagopa";
import { NumberFromString } from "./number";
/* 
    Contains utility functions to check conditions
    used across project (currently just in CardComponent)
 */

export const isExpiredCard = (creditCard: CreditCard) => {
  const today: Date = new Date();
  const cmpM: number = today.getMonth() + 1;
  const cmpY: number = parseInt(
    today
      .getFullYear()
      .toString()
      .slice(2),
    10
  );
  const decodedValueYear = NumberFromString.decode(creditCard.expireYear);
  const ccExpireYear = decodedValueYear.isRight()
    ? decodedValueYear.value
    : creditCard.expireYear;
  const decodedValueMonth = NumberFromString.decode(creditCard.expireMonth);
  const ccExpireMonth = decodedValueMonth.isRight()
    ? decodedValueMonth.value
    : creditCard.expireMonth;

  return ccExpireYear < cmpY || (ccExpireYear === cmpY && ccExpireMonth < cmpM);
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
