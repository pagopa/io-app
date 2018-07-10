import { EnteBeneficiario } from "../../definitions/pagopa-proxy/EnteBeneficiario";
import {
  RptId,
  PaymentNoticeNumber
} from "../../node_modules/italia-ts-commons/lib/pagopa";
import { OrganizationFiscalCode } from "../../node_modules/italia-ts-commons/lib/strings";

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
