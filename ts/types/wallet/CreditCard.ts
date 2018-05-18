import * as t from "io-ts";

export const CreditCardType = t.union([
  t.literal("VISA"),
  t.literal("MASTERCARD"),
  t.literal("MAESTRO"),
  t.literal("AMEX"),
  t.literal("JCB"),
  t.literal("DINERS"),
  t.literal("DISCOVER"),
  t.literal("VISAELECTRON"),
  t.literal("POSTEPAY"),
  t.literal("UNIONPAY"),
  t.literal("UNKNOWN")
]);
export type CreditCardType = t.TypeOf<typeof CreditCardType>;

export const CreditCard = t.type({
  id: t.number,
  owner: t.string,
  pan: t.string,
  lastUsage: t.string,
  expirationDate: t.string,
  type: CreditCardType
});
export type CreditCard = t.TypeOf<typeof CreditCard>;

export function getCardTypeFromPAN(pan: string): CreditCardType {
  const regexps: { [key in CreditCardType]: RegExp } = {
    "VISAELECTRON": /^(4026|417500|4405|4508|4844|4913|4917)\d+$/,
    "MAESTRO": /^(5018|5020|5038|5612|5893|6304|6759|6761|6762|6763|0604|6390)\d+$/,
    "UNIONPAY": /^(62|88)\d+$/,
    "VISA": /^4[0-9]{12}(?:[0-9]{3})?$/,
    "MASTERCARD": /^5[1-5][0-9]{14}$/,
    "AMEX": /^3[47][0-9]{13}$/,
    "DINERS": /^3(?:0[0-5]|[68][0-9])[0-9]{11}$/,
    "DISCOVER": /^6(?:011|5[0-9]{2})[0-9]{12}$/,
    "JCB": /^(?:2131|1800|35\d{3})\d{11}$/,
    "POSTEPAY": /^(402360|402361|403035|417631|529948)\d{11}$/,
    "UNKNOWN": /^$/
  };
  const compactPAN = pan.replace(/\s/g, "");

  for (const key in regexps) {
    const keyType: CreditCardType = key as CreditCardType; // for..in iterates over strings
    if (regexps[keyType].test(compactPAN)) {
      return keyType;
    }
  }
  return "UNKNOWN";
}

export function getIconByCardType(type: CreditCardType) {
  const icons: { [key in CreditCardType]?: any } = {
  "MASTERCARD": require("../../../img/wallet/cards-icons/mastercard.png"),
  "VISA": require("../../../img/wallet/cards-icons/visa.png"),
  "AMEX": require("../../../img/wallet/cards-icons/amex.png"),
  "DINERS": require("../../../img/wallet/cards-icons/diners.png"),
  "MAESTRO": require("../../../img/wallet/cards-icons/maestro.png"),
  "VISAELECTRON": require("../../../img/wallet/cards-icons/visa-electron.png"),
  "POSTEPAY": require("../../../img/wallet/cards-icons/postepay.png"),
  "UNKNOWN": require("../../../img/wallet/cards-icons/unknown.png")
  };
  return (icons[type] !== undefined) ? icons[type] : icons["UNKNOWN"];
}

export const UNKNOWN_CARD: CreditCard = {
  id: -1,
  owner: "nobody",
  pan: "0000 0000 0000 0000",
  lastUsage: "Never",
  expirationDate: "??/??",
  type: "UNKNOWN"
};