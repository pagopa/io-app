import { AmountInEuroCents } from "@pagopa/io-pagopa-commons/lib/pagopa";

import { TypeEnum } from "../../definitions/pagopa/Wallet";
import {
  CreditCardCVC,
  CreditCardExpirationMonth,
  CreditCardExpirationYear,
  CreditCardPan
} from "../utils/input";
import { Amount, Wallet } from "./pagopa";

const UNKNOWN_STRING = "?";
const UNKNOWN_NUMBER = -1;
const UNKNOWN_DATE = new Date("?");

const UNKNOWN_CARD_PAN = "****************" as CreditCardPan;
const UNKNOWN_CARD_HOLDER = "NO HOLDER";
const UNKNWON_CARD_TYPE = "UNKNOWN";
const UNKNOWN_LAST_USAGE = UNKNOWN_DATE;
const UNKNOWN_EXPIRATION_MONTH = "01" as CreditCardExpirationMonth;
const UNKNOWN_EXPIRATION_YEAR = "00" as CreditCardExpirationYear;
const UNKNOWN_SECURITY_CODE = "000" as CreditCardCVC;

const UNKNOWN_AMOUNT_PAGOPA: Amount = {
  amount: 0,
  currency: "EUR",
  currencyNumber: "0",
  decimalDigits: 2
};

export const UNKNOWN_CARD: Wallet = {
  creditCard: {
    brandLogo: UNKNWON_CARD_TYPE,
    expireMonth: UNKNOWN_EXPIRATION_MONTH,
    expireYear: UNKNOWN_EXPIRATION_YEAR,
    flag3dsVerified: false,
    holder: UNKNOWN_CARD_HOLDER,
    id: UNKNOWN_NUMBER,
    pan: UNKNOWN_CARD_PAN,
    securityCode: UNKNOWN_SECURITY_CODE
  },
  type: TypeEnum.CREDIT_CARD,
  favourite: false,
  idPsp: UNKNOWN_NUMBER,
  idWallet: UNKNOWN_NUMBER,
  lastUsage: UNKNOWN_LAST_USAGE,
  psp: {
    businessName: UNKNOWN_STRING,
    fixedCost: UNKNOWN_AMOUNT_PAGOPA,
    id: UNKNOWN_NUMBER,
    logoPSP: UNKNOWN_STRING
  }
};

export const UNKNOWN_AMOUNT = "9999999999" as AmountInEuroCents;
export const UNKNOWN_PAYMENT_REASON = UNKNOWN_STRING;
