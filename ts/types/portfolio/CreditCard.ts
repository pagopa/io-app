import { CreditCardType } from "./CreditCardType";

export class CreditCard {
  public static getCardType(cardNumber: string): CreditCardType {
    if (cardNumber === undefined || cardNumber === null) {
      return CreditCardType.UNKNOWN;
    }

    const shortCardNumber = cardNumber.replace(/\s/g, "");

    const regexps: { [key: string]: RegExp } = {
      electron: /^(4026|417500|4405|4508|4844|4913|4917)\d+$/,
      maestro: /^(5018|5020|5038|5612|5893|6304|6759|6761|6762|6763|0604|6390)\d+$/,
      unionpay: /^(62|88)\d+$/,
      visa: /^4[0-9]{12}(?:[0-9]{3})?$/,
      mastercard: /^5[1-5][0-9]{14}$/,
      amex: /^3[47][0-9]{13}$/,
      diners: /^3(?:0[0-5]|[68][0-9])[0-9]{11}$/,
      discover: /^6(?:011|5[0-9]{2})[0-9]{12}$/,
      jcb: /^(?:2131|1800|35\d{3})\d{11}$/,
      postepay: /^(402360|402361|403035|417631|529948)\d{11}$/
    };

    for (const key in regexps) {
      if (regexps[key].test(shortCardNumber)) {
        switch (key) {
          case "electron":
            return CreditCardType.VISAELECTRON;

          case "maestro":
            return CreditCardType.MAESTRO;

          case "amex":
            return CreditCardType.AMEX;

          case "diners":
            return CreditCardType.DINERS;

          case "mastercard":
            return CreditCardType.MASTERCARD;

          case "visa":
            return CreditCardType.VISA;

          default:
            return CreditCardType.UNKNOWN;
        }
      }
    }
    return CreditCardType.UNKNOWN;
  }

  public readonly brand: CreditCardType;
  constructor(
    public id: number,
    public lastUsage: string,
    public number: string,
    public image: any,
    public owner: string,
    public expires: string
  ) {
    this.brand = CreditCard.getCardType(this.number);
  }
}

export const UNKNOWN_CARD: CreditCard = {
  id: -1,
  brand: CreditCardType.AMEX,
  lastUsage: "???",
  number: "0",
  image: null,
  owner: "???",
  expires: "???"
};
