import { PaymentNoticeNumber, RptId } from "italia-ts-commons/lib/pagopa";
import { AmountInEuroCents } from "italia-ts-commons/lib/pagopa";
import { OrganizationFiscalCode } from "italia-ts-commons/lib/strings";
import { EnteBeneficiario } from "../../definitions/pagopa-proxy/EnteBeneficiario";
import { Wallet } from "../../definitions/pagopa/Wallet";

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

export const UNKNOWN_CARD: Wallet = {
  creditCard: {
    brandLogo: "UNKNOWN",
    expireMonth: "00",
    expireYear: "00",
    flag3dsVerified: false,
    holder: UNKNOWN_CARD_HOLDER,
    id: -1,
    pan: UNKNOWN_CARD_PAN
  },
  favourite: false,
  idPsp: -1,
  id: -1,
  lastUsage: "???",
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
