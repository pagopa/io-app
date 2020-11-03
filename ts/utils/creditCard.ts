import { fromNullable, Option } from "fp-ts/lib/Option";
import { ImageURISource } from "react-native";

export type IconSource = (string & ImageURISource) | undefined;

type CreditCardDetector = {
  blocks: Record<string, ReadonlyArray<number>>;
  re: Record<string, RegExp>;
  cardIcons: Record<string, IconSource>;
  getInfo: (pan: string) => Option<string>;
  getIcon: (pan: Option<string>) => IconSource;
};

export const CreditCardDetector: CreditCardDetector = {
  blocks: {
    uatp: [4, 5, 6],
    amex: [4, 6, 5],
    diners: [4, 6, 4],
    discover: [4, 4, 4, 4],
    mastercard: [4, 4, 4, 4],
    dankort: [4, 4, 4, 4],
    instapayment: [4, 4, 4, 4],
    jcb15: [4, 6, 5],
    jcb: [4, 4, 4, 4],
    maestro: [4, 4, 4, 4],
    visa: [4, 4, 4, 4],
    mir: [4, 4, 4, 4],
    unionPay: [4, 4, 4, 4],
    general: [4, 4, 4, 4],
    generalStrict: [4, 4, 4, 7]
  },

  /* 
  Credit card brands are recognized by matching against regular expressions.
  Many brands are known to be recognized by the following regexps, but to not support them.
 
  uatp: /^(?!1800)1\d{0,14}/, starts with 1; 15 digits, not starts with 1800 (jcb card)
  dankort: /^(5019|4175|4571)\d{0,12}/, starts with 5019/4175/4571; 16 digits 
  instapayment: /^63[7-9]\d{0,13}/, starts with 637-639; 16 digits
  */
  re: {
    // Note: regexes are checked in the same order as listed
    // starts with 34/37; 15 digits
    amex: /^3[47]\d{0,13}/,

    // starts with 6011/65/644-649; 16 digits
    discover: /^(?:6011|65\d{0,2}|64[4-9]\d?)\d{0,12}/,

    // starts with 300-305/309 or 36/38/39; 14 digits
    diners: /^3(?:0([0-5]|9)|[689]\d?)\d{0,11}/,

    // starts with 51-55/2221–2720; 16 digits
    mastercard: /^(5[1-5]\d{0,2}|22[2-9]\d{0,1}|2[3-7]\d{0,2})\d{0,12}/,

    // starts with 2131/1800; 15 digits
    jcb15: /^(?:2131|1800)\d{0,11}/,

    // starts with 2131/1800/35; 16 digits
    jcb: /^(?:35\d{0,2})\d{0,12}/,

    // starts with 50/56-58/6304/67; 16 digits
    maestro: /^(?:5[0678]\d{0,2}|6304|67\d{0,2})\d{0,12}/,

    // starts with 4; 16 digits
    visa: /^4\d{0,15}/,

    // starts with 62; 16 digits
    unionpay: /^62\d{0,14}/,

    unknown: /.*/
  },

  cardIcons: {
    mastercard: require("../../img/wallet/cards-icons/form/mastercard.png"),
    visa: require("../../img/wallet/cards-icons/form/visa.png"),
    amex: require("../../img/wallet/cards-icons/form/amex.png"),
    diners: require("../../img/wallet/cards-icons/form/diners.png"),
    maestro: require("../../img/wallet/cards-icons/form/maestro.png"),
    unionpay: require("../../img/wallet/cards-icons/form/unionpay.png"),
    discover: require("../../img/wallet/cards-icons/form/discover.png"),
    jcb: require("../../img/wallet/cards-icons/form/jcb.png"),
    jcb15: require("../../img/wallet/cards-icons/form/jcb.png"),
    unknown: "io-carta"
  },

  getInfo: (pan: string) => {
    const re = CreditCardDetector.re;

    // Some credit card can have up to 19 digits number.
    // Set strictMode to true will remove the 16 max-length restrain,
    // however, I never found any website validate card number like
    // this, hence probably you don't want to enable this option.
    return fromNullable(Object.keys(re).find(k => re[k].test(pan)));
  },

  getIcon: (pan: Option<string>) => {
    const cardIcons = CreditCardDetector.cardIcons;
    const getInfo = CreditCardDetector.getInfo;

    return pan
      .chain(myPan => getInfo(myPan))
      .map(brand => cardIcons[brand])
      .getOrElse(cardIcons.unknown);
  }
};
