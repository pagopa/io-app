import { PaymentNoticeNumber, RptId } from "italia-ts-commons/lib/pagopa";
import { AmountInEuroCents } from "italia-ts-commons/lib/pagopa";
import { OrganizationFiscalCode } from "italia-ts-commons/lib/strings";
import { EnteBeneficiario } from "../../definitions/backend/EnteBeneficiario";
import { Wallet } from "../../definitions/pagopa/Wallet";
import { CreditCardType } from "./CreditCard";

export const UNKNOWN_RECIPIENT: EnteBeneficiario = {
  identificativoUnivocoBeneficiario: "?",
  denominazioneBeneficiario: "?",
  codiceUnitOperBeneficiario: "?",
  denomUnitOperBeneficiario: "?",
  indirizzoBeneficiario: "?",
  civicoBeneficiario: "?",
  capBeneficiario: "?",
  localitaBeneficiario: "?",
  provinciaBeneficiario: "?",
  nazioneBeneficiario: "?"
};

export const UNKNOWN_ORGANIZATION_FISCAL_CODE = "00000000000" as OrganizationFiscalCode;

export const UNKNOWN_PAYMENT_NOTICE_NUMBER = {
  auxDigit: "0",
  applicationCode: "00",
  iuv13: "0000000000000"
} as PaymentNoticeNumber;

export const UNKNOWN_RPTID: RptId = {
  organizationFiscalCode: UNKNOWN_ORGANIZATION_FISCAL_CODE,
  paymentNoticeNumber: UNKNOWN_PAYMENT_NOTICE_NUMBER
};

export const UNKNOWN_CARD_PAN = "0000";
export const UNKNOWN_CARD_HOLDER = "NO HOLDER";
export const UNKNWON_CARD_TYPE: CreditCardType = "UNKNOWN";
export const UNKNOWN_LAST_USAGE = new Date("?");
export const UNKNOWN_EXPIRATION_MONTH = "??";
export const UNKNOWN_EXPIRATION_YEAR = "??";
export const UNKNOWN_EXPIRATION_DATE = `${UNKNOWN_EXPIRATION_MONTH}/${UNKNOWN_EXPIRATION_YEAR}`;

export const UNKNOWN_CARD: Wallet = {
  creditCard: {
    brandLogo: UNKNWON_CARD_TYPE,
    expireMonth: UNKNOWN_EXPIRATION_MONTH,
    expireYear: UNKNOWN_EXPIRATION_YEAR,
    flag3dsVerified: false,
    holder: UNKNOWN_CARD_HOLDER,
    id: -1,
    pan: UNKNOWN_CARD_PAN
  },
  favourite: false,
  idPsp: -1,
  idWallet: -1,
  lastUsage: UNKNOWN_LAST_USAGE,
  psp: {
    businessName: "None",
    fixedCost: {
      amount: 0,
      currency: "EUR",
      decimalDigits: 2
    }
  }
};

export const UNKNOWN_AMOUNT = "9999999999" as AmountInEuroCents;
export const UNKNOWN_PAYMENT_REASON = "";
