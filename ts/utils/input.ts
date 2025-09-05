import * as O from "fp-ts/lib/Option";
import * as E from "fp-ts/lib/Either";
import * as t from "io-ts";
import * as _ from "lodash";
import { PatternString } from "@pagopa/ts-commons/lib/strings";
import { pipe } from "fp-ts/lib/function";
import I18n from "i18next";
import { CreditCard } from "../types/pagopa";
import { CreditCardDetector, SupportedBrand } from "./creditCard";
import { isStringNullyOrEmpty } from "./strings";

export const MIN_PAN_DIGITS = 12;
const MAX_PAN_DIGITS = 19;

/**
 * A string that matches credit cards PAN
 *
 * Note: pagoPA's pan may contain '*'s to hide part of the pan
 */
export const CreditCardPan = PatternString(
  `^[0-9\\*]{${MIN_PAN_DIGITS},${MAX_PAN_DIGITS}}$`
);
export type CreditCardPan = t.TypeOf<typeof CreditCardPan>;

export const CreditCardHolder = PatternString(`^([\x20-\x5f\x61-\x7d]+)$`);

export type CreditCardHolder = t.TypeOf<typeof CreditCardHolder>;
/**
 * A string that matches a two digits month number (00-12)
 */
export const CreditCardExpirationMonth = PatternString("^(0[1-9]|1[0-2])$");
export type CreditCardExpirationMonth = t.TypeOf<
  typeof CreditCardExpirationMonth
>;

/**
 * A string that matches a two digits year number (00-99)
 */
// FIXME: check that expiration year is >= current year
// (possibly check month as well if year == current year)
export const CreditCardExpirationYear = PatternString("^[0-9]{2}$");
export type CreditCardExpirationYear = t.TypeOf<
  typeof CreditCardExpirationYear
>;

/**
 * A string that matches a credit card CVC code
 */
export const CreditCardCVC = PatternString("^[0-9]{3,4}$");
export type CreditCardCVC = t.TypeOf<typeof CreditCardCVC>;

export const INITIAL_CARD_FORM_STATE: CreditCardState = {
  pan: O.none,
  expirationDate: O.none,
  securityCode: O.none,
  holder: O.none
};

export const isValidPan = (pan: O.Option<string>) =>
  pipe(
    pan,
    O.map(pan => CreditCardPan.is(pan)),
    O.toUndefined
  );

export const isValidSecurityCode = (
  securityCode: O.Option<string>
): boolean | undefined =>
  pipe(
    securityCode,
    O.map(securityCode => CreditCardCVC.is(securityCode)),
    O.toUndefined
  );

export type CreditCardState = Readonly<{
  pan: O.Option<string>;
  expirationDate: O.Option<string>;
  securityCode: O.Option<string>;
  holder: O.Option<string>;
}>;

export type CreditCardStateKeys = keyof CreditCardState;

// TODO: update this function including all the form errors when fp-ts will be updated.
// Refers to https://dev.to/gcanti/getting-started-with-fp-ts-either-vs-validation-5eja
/**
 * @param state A pending credit card state objects, containing the card's components.
 * @returns A fp-ts Either containing a valid CreditCard object if right or if it's left undefined if at least one field is none
 * or the label of the first invalid field.
 */
export function getCreditCardFromState(
  state: CreditCardState
): E.Either<string, CreditCard> {
  const { pan, expirationDate, securityCode, holder } = state;
  if (
    O.isNone(pan) ||
    O.isNone(expirationDate) ||
    O.isNone(securityCode) ||
    O.isNone(holder)
  ) {
    return E.left(
      I18n.t("wallet.dummyCard.accessibility.button.missingFields")
    );
  }

  if (!isValidCardHolder(holder)) {
    return E.left(
      I18n.t("wallet.dummyCard.accessibility.button.fieldError", {
        field: I18n.t("wallet.dummyCard.labels.holder.label")
      })
    );
  }

  if (!CreditCardPan.is(pan.value)) {
    // invalid pan
    return E.left(
      I18n.t("wallet.dummyCard.accessibility.button.fieldError", {
        field: I18n.t("wallet.dummyCard.labels.pan")
      })
    );
  }

  const [expirationMonth, expirationYear] = expirationDate.value.split("/");

  if (
    !CreditCardExpirationMonth.is(expirationMonth) ||
    !CreditCardExpirationYear.is(expirationYear)
  ) {
    // invalid date
    return E.left(
      I18n.t("wallet.dummyCard.accessibility.button.fieldError", {
        field: I18n.t("wallet.dummyCard.labels.expirationDate")
      })
    );
  }

  if (!CreditCardCVC.is(securityCode.value)) {
    const detectedBrand: SupportedBrand =
      CreditCardDetector.validate(securityCode);

    // invalid cvc
    return E.left(
      I18n.t("wallet.dummyCard.accessibility.button.fieldError", {
        field: I18n.t(
          detectedBrand.cvvLength === 4
            ? "wallet.dummyCard.labels.securityCode4D"
            : "wallet.dummyCard.labels.securityCode"
        )
      })
    );
  }

  const card: CreditCard = {
    pan: pan.value,
    holder: holder.value,
    expireMonth: expirationMonth,
    expireYear: expirationYear,
    securityCode: securityCode.value
  };

  return E.right(card);
}

/**
 * This function checks if the cardholder charset is admitted.
 * We consider not a valid character an accented character.
 *
 * @param cardHolder
 */
export const isValidCardHolder = (cardHolder: O.Option<string>): boolean =>
  pipe(
    cardHolder,
    O.fold(
      () => false,
      cH => {
        const cardHolderWithoutDiacriticalMarks = _.deburr(cH);
        if (cH === cardHolderWithoutDiacriticalMarks) {
          return CreditCardHolder.is(cH) && !isStringNullyOrEmpty(cH);
        }
        return false;
      }
    )
  );
