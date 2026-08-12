import { PaymentDataBase } from "@io-app/api-types/generated/definitions/communication/PaymentDataBase";
import { PaymentDataWithRequiredPayee } from "@io-app/api-types/generated/definitions/communication/PaymentDataWithRequiredPayee";
import { PaymentFaultV2Enum } from "@io-app/api-types/generated/definitions/communication/PaymentFaultV2";
import { ServiceDetails } from "@io-app/api-types/generated/definitions/services/ServiceDetails";

export const enum CreditCardBrandEnum {
  "AMEX" = "AMEX",
  "DINERS" = "DINERS",
  "MAESTRO" = "MAESTRO",
  "MASTERCARD" = "MASTERCARD",
  // "DISCOVER" = "DISCOVER",
  // "JCB" = "JCB",
  "POSTEPAY" = "POSTEPAY",
  // "UNIONPAY" = "UNIONPAY",
  "VISA" = "VISA",
  "VISAELECTRON" = "VISAELECTRON",
  "VPAY" = "VPAY"
}

export const creditCardBrands: ReadonlyArray<CreditCardBrandEnum> = [
  CreditCardBrandEnum.VISAELECTRON,
  CreditCardBrandEnum.MAESTRO,
  // CreditCardBrandEnum.UNIONPAY,
  CreditCardBrandEnum.VISA,
  CreditCardBrandEnum.MASTERCARD,
  CreditCardBrandEnum.AMEX,
  CreditCardBrandEnum.DINERS,
  // CreditCardBrandEnum.DISCOVER,
  CreditCardBrandEnum.POSTEPAY,
  CreditCardBrandEnum.VPAY
];

const creditCardLogoMap: Map<CreditCardBrandEnum, string> = new Map<
  CreditCardBrandEnum,
  string
>([
  [CreditCardBrandEnum.AMEX, "amex"],
  [CreditCardBrandEnum.DINERS, "diners"],
  [CreditCardBrandEnum.MAESTRO, "maestro"],
  [CreditCardBrandEnum.MASTERCARD, "mc"],
  [CreditCardBrandEnum.POSTEPAY, "poste"],
  [CreditCardBrandEnum.VISA, "visa"],
  [CreditCardBrandEnum.VISAELECTRON, "visaelectron"],
  [CreditCardBrandEnum.VPAY, "vpay"]
]);
export const getCreditCardLogo = (cc: CreditCardBrandEnum) =>
  creditCardLogoMap.has(cc)
    ? `https://wisp2.pagopa.gov.it/wallet/assets/img/creditcard/carta_${creditCardLogoMap.get(
        cc
      )}.png`
    : undefined;

// undefined -> 0 -> success
export const isOutcomeCodeSuccessfully = (
  outcome: number | undefined
): boolean => (outcome ?? 0) === 0;

export const rptIdFromPaymentDataWithRequiredPayee = (
  paymentDataWithRequiredPayee: PaymentDataWithRequiredPayee
): string =>
  `${paymentDataWithRequiredPayee.payee.fiscal_code}${paymentDataWithRequiredPayee.notice_number}`;

export const rptIdFromServiceAndPaymentData = (
  service: ServiceDetails,
  paymentData: PaymentDataBase
) => `${service.organization.fiscal_code}${paymentData.notice_number}`;

export const detailV2EnumToPaymentProblemJSON = (
  details: PaymentFaultV2Enum
): { detail_v2: PaymentFaultV2Enum } => ({
  detail_v2: details
});
