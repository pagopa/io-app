import { pipe } from "fp-ts/lib/function";
import * as O from "fp-ts/lib/Option";
import * as AR from "fp-ts/lib/Array";
import { ImageURISource } from "react-native";
import { IOIcons } from "@pagopa/io-app-design-system";

export type IconSource = ImageURISource | IOIcons | undefined;

export type SupportedBrand = {
  name: string;
  re: RegExp;
  cvvLength: number;
  luhnVal: boolean;
  iconForm: IconSource;
};

type CreditCardDetector = {
  supportedBrands: Record<string, SupportedBrand>;
  validate: (pan: O.Option<string>) => SupportedBrand;
};

export const CreditCardDetector: CreditCardDetector = {
  supportedBrands: {
    // Credit card brands are recognized by matching against regular expressions.
    // Many brands are known to be recognized by the following regexps, but to not support them.
    // Unsupported, so useful for negative tests:
    //  - uatp: /^(?!1800)1\d{0,14}/, starts with 1; 15 digits, not starts with 1800 (jcb card)
    //  - dankort: /^(5019|4175|4571)\d{0,12}/, starts with 5019/4175/4571; 16 digits
    //  - instapayment: /^63[7-9]\d{0,13}/, starts with 637-639; 16 digits

    // Don't change the order, regexps are not guaranteed to be mutually exclusive
    amex: {
      // amex starts with 34/37; 15 digits
      name: "amex",
      re: /^3[47]\d{0,13}/,
      cvvLength: 4,
      luhnVal: true,
      iconForm: require("../../img/wallet/cards-icons/form/amex.png")
    },
    discover: {
      // discover starts with 6011/65/644-649; 16 digits
      name: "discover",
      re: /^(?:6011|65\d{0,2}|64[4-9]\d?)\d{0,12}/,
      cvvLength: 3,
      luhnVal: true,
      iconForm: require("../../img/wallet/cards-icons/form/discover.png")
    },
    diners: {
      // diners starts with 300-305/309 or 36/38/39; 14 digits
      name: "diners",
      re: /^3(?:0([0-5]|9)|[689]\d?)\d{0,11}/,
      cvvLength: 3,
      luhnVal: true,
      iconForm: require("../../img/wallet/cards-icons/form/diners.png")
    },
    mastercard: {
      // mastercad starts with 51-55/2221–2720; 16 digits
      name: "mastercard",
      re: /^(5[1-5]\d{0,2}|22[2-9]\d{0,1}|2[3-7]\d{0,2})\d{0,12}/,
      cvvLength: 3,
      luhnVal: true,
      iconForm: require("../../img/wallet/cards-icons/form/mastercard.png")
    },
    jcb: {
      // jcb starts with 35; 16 digits
      name: "jcb",
      re: /^(?:35\d{0,2})\d{0,12}/,
      cvvLength: 3,
      luhnVal: true,
      iconForm: require("../../img/wallet/cards-icons/form/jcb.png")
    },
    jcb15: {
      // jcb can also start with 2131/1800; 15 digits
      name: "jcb15",
      re: /^(?:2131|1800)\d{0,11}/,
      cvvLength: 3,
      luhnVal: true,
      iconForm: require("../../img/wallet/cards-icons/form/jcb.png")
    },
    maestro: {
      // maestro starts with 50/56-58/6304/67; 16 digits
      name: "maestro",
      re: /^(?:5[0678]\d{0,2}|6304|67\d{0,2})\d{0,12}/,
      cvvLength: 3,
      luhnVal: true,
      iconForm: require("../../img/wallet/cards-icons/form/maestro.png")
    },
    visa: {
      // starts with 4; 16 digits
      name: "visa",
      re: /^4\d{0,15}/, // too weak?
      cvvLength: 3,
      luhnVal: true,
      iconForm: require("../../img/wallet/cards-icons/form/visa.png")
    },
    unionpay: {
      // unionpay starts with 62; 16 digits
      name: "unionpay",
      re: /^62\d{0,14}/,
      cvvLength: 3,
      luhnVal: true,
      iconForm: require("../../img/wallet/cards-icons/form/unionpay.png")
    },
    unknown: {
      name: "unknown",
      re: /.*/,
      cvvLength: 3,
      luhnVal: true,
      iconForm: "creditCard"
    }
  },

  validate: (pan: O.Option<string>) => {
    const supportedBrands = CreditCardDetector.supportedBrands;
    const supportedBrandsValues = Object.values(supportedBrands);
    return pipe(
      pan,
      O.chain(myPan =>
        pipe(
          supportedBrandsValues,
          AR.findFirst(brand => brand.re.test(myPan))
        )
      ),
      O.getOrElse(() => supportedBrands.unknown)
    );
  }
};
