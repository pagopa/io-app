import { Option, none } from "fp-ts/lib/Option";
import { Either, left, right } from "fp-ts/lib/Either";
import * as t from "io-ts";
import * as _ from "lodash";
import { PatternString } from "italia-ts-commons/lib/strings";
import { CreditCard } from "../types/pagopa";
import I18n from "../i18n";
import { CreditCardDetector, SupportedBrand } from "./creditCard";

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
  pan: none,
  expirationDate: none,
  securityCode: none,
  holder: none
};

export const isValidPan = (pan: Option<string>) =>
  pan.map(pan => CreditCardPan.is(pan)).toUndefined();

export const isValidSecurityCode = (
  securityCode: Option<string>
): boolean | undefined =>
  securityCode
    .map(securityCode => CreditCardCVC.is(securityCode))
    .toUndefined();

export type CreditCardState = Readonly<{
  pan: Option<string>;
  expirationDate: Option<string>;
  securityCode: Option<string>;
  holder: Option<string>;
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
): Either<string, CreditCard> {
  const { pan, expirationDate, securityCode, holder } = state;
  if (
    pan.isNone() ||
    expirationDate.isNone() ||
    securityCode.isNone() ||
    holder.isNone()
  ) {
    return left(I18n.t("wallet.dummyCard.accessibility.button.missingFields"));
  }

  if (!isValidCardHolder(holder)) {
    return left(
      I18n.t("wallet.dummyCard.accessibility.button.fieldError", {
        field: I18n.t("wallet.dummyCard.labels.holder.label")
      })
    );
  }

  if (!CreditCardPan.is(pan.value)) {
    // invalid pan
    return left(
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
    return left(
      I18n.t("wallet.dummyCard.accessibility.button.fieldError", {
        field: I18n.t("wallet.dummyCard.labels.expirationDate")
      })
    );
  }

  if (!CreditCardCVC.is(securityCode.value)) {
    const detectedBrand: SupportedBrand =
      CreditCardDetector.validate(securityCode);

    // invalid cvc
    return left(
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

  return right(card);
}

/**
 * This function checks if the cardholder charset is admitted.
 * We consider not a valid character an accented character.
 *
 * @param cardHolder
 */
export const isValidCardHolder = (cardHolder: Option<string>): boolean =>
  cardHolder.fold(false, cH => {
    const cardHolderWithoutDiacriticalMarks = _.deburr(cH);
    return cH === cardHolderWithoutDiacriticalMarks;
  });
