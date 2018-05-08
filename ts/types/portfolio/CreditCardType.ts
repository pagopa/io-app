
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

type CreditCardIconMap = {
  [ key in keyof typeof CreditCardType ]: any
};

export const CreditCardIcons: CreditCardIconMap = {
  MASTERCARD: require("../../../img/portfolio/cards-icons/mastercard.png"),
  VISA: require("../../../img/portfolio/cards-icons/visa.png"),
  AMEX: require("../../../img/portfolio/cards-icons/amex.png"),
  DINERS: require("../../../img/portfolio/cards-icons/diners.png"),
  MAESTRO: require("../../../img/portfolio/cards-icons/maestro.png"),
  VISAELECTRON: require("../../../img/portfolio/cards-icons/visa-electron.png"),
  POSTEPAY: require("../../../img/portfolio/cards-icons/postepay.png"),
  UNKNOWN: require("../../../img/portfolio/cards-icons/unknown.png")
};