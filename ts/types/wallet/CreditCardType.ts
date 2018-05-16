export enum CreditCardType {
  VISA = "VISA",
  MASTERCARD = "MASTERCARD",
  MAESTRO = "MAESTRO",
  AMEX = "AMEX",
  DINERS = "DINERS",
  VISAELECTRON = "VISAELECTRON",
  UNKNOWN = "UNKNOWN",
  POSTEPAY = "POSTEPAY"
}

type CreditCardIconMap = { [key in keyof typeof CreditCardType]: any };

export const CreditCardIcons: CreditCardIconMap = {
  MASTERCARD: require("../../../img/wallet/cards-icons/mastercard.png"),
  VISA: require("../../../img/wallet/cards-icons/visa.png"),
  AMEX: require("../../../img/wallet/cards-icons/amex.png"),
  DINERS: require("../../../img/wallet/cards-icons/diners.png"),
  MAESTRO: require("../../../img/wallet/cards-icons/maestro.png"),
  VISAELECTRON: require("../../../img/wallet/cards-icons/visa-electron.png"),
  POSTEPAY: require("../../../img/wallet/cards-icons/postepay.png"),
  UNKNOWN: require("../../../img/wallet/cards-icons/unknown.png")
};
