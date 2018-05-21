import * as t from "io-ts";
import { NonEmptyString, PatternString } from "italia-ts-commons/lib/strings";

const CreditCardUnknown = t.type(
  {
    id: t.number,
    lastUsage: NonEmptyString,
    pan: PatternString("^[0-9]+$"),
    owner: NonEmptyString,
    expirationDate: NonEmptyString
  },
  "UNKNOWN"
);

const newCreditCardType = (pattern: string, name: string) =>
  t.refinement(
    CreditCardUnknown,
    cc => PatternString(pattern).is(cc.pan),
    name
  );

const CreditCardElectron = newCreditCardType(
  "^(4026|417500|4405|4508|4844|4913|4917)[0-9]{12}$",
  "VISAELECTRON"
);
type CreditCardElectron = t.TypeOf<typeof CreditCardElectron>;

const CreditCardMaestro = newCreditCardType(
  "^(5018|5020|5038|5612|5893|6304|6759|6761|6762|6763|0604|6390)[0-9]{12}$",
  "MAESTRO"
);
type CreditCardMaestro = t.TypeOf<typeof CreditCardMaestro>;

const CreditCardUnionpay = newCreditCardType("^(62|88)d+$", "UNIONPAY");
type CreditCardUnionpay = t.TypeOf<typeof CreditCardUnionpay>;

const CreditCardVisa = newCreditCardType("^4[0-9]{12}(?:[0-9]{3})?$", "VISA");
type CreditCardVisa = t.TypeOf<typeof CreditCardVisa>;

const CreditCardMastercard = newCreditCardType(
  "^5[1-5][0-9]{14}$",
  "MASTERCARD"
);
type CreditCardMastercard = t.TypeOf<typeof CreditCardMastercard>;

const CreditCardAmex = newCreditCardType("^3[47][0-9]{13}$", "AMEX");
type CreditCardAmex = t.TypeOf<typeof CreditCardAmex>;

const CreditCardDiners = newCreditCardType(
  "^3(?:0[0-5]|[68][0-9])[0-9]{11}$",
  "DINERS"
);
type CreditCardDiners = t.TypeOf<typeof CreditCardDiners>;

const CreditCardDiscover = newCreditCardType(
  "^6(?:011|5[0-9]{2})[0-9]{12}$",
  "DISCOVER"
);
type CreditCardDiscover = t.TypeOf<typeof CreditCardDiscover>;

const CreditCardJcb = newCreditCardType("^(?:2131|1800|35d{3})d{11}$", "JCB");
type CreditCardJcb = t.TypeOf<typeof CreditCardJcb>;

const CreditCardPostepay = newCreditCardType(
  "^(402360|402361|403035|417631|529948)d{11}$",
  "POSTEPAY"
);
type CreditCardPostepay = t.TypeOf<typeof CreditCardPostepay>;

export const CreditCard = t.union([
  CreditCardElectron,
  CreditCardMaestro,
  CreditCardUnionpay,
  CreditCardVisa,
  CreditCardMastercard,
  CreditCardAmex,
  CreditCardDiners,
  CreditCardDiscover,
  CreditCardJcb,
  CreditCardPostepay,
  CreditCardUnknown
]);
export type CreditCard = t.TypeOf<typeof CreditCard>;

export const UNKNOWN_CARD: CreditCard = {
  owner: "?" as NonEmptyString,
  pan: "0000000000000000",
  expirationDate: "??/??" as NonEmptyString,
  id: -1,
  lastUsage: "?" as NonEmptyString
};

export const getCardType = (cc: CreditCard) =>
  CreditCard.types
    .filter(type => type.is(cc) && type.name !== "UNKNOWN")
    .reduce((p, c) => (c ? c.name : p), "UNKNOWN");
