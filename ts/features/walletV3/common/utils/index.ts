import * as O from "fp-ts/lib/Option";
import {
  IOLogoPaymentType,
  IOPaymentLogos,
  ListItemTransactionStatusWithBadge
} from "@pagopa/io-app-design-system";
import I18n from "i18n-js";
import { pipe } from "fp-ts/lib/function";

import { isExpiredDate } from "../../../../utils/dates";
import { ServiceNameEnum } from "../../../../../definitions/pagopa/walletv3/ServiceName";
import { PaymentSupportStatus } from "../../../../types/paymentMethodCapabilities";
import {
  TypeEnum,
  WalletInfoDetails,
  WalletInfoDetails1
} from "../../../../../definitions/pagopa/walletv3/WalletInfoDetails";
import { ServiceStatusEnum } from "../../../../../definitions/pagopa/walletv3/ServiceStatus";
import { WalletInfo } from "../../../../../definitions/pagopa/walletv3/WalletInfo";
import { findFirstCaseInsensitive } from "../../../../utils/object";

/**
 * A simple function to get the corresponding translated badge text,
 * based on the transaction status.
 */

export const getBadgeTextByTransactionStatus = (
  transactionStatus: ListItemTransactionStatusWithBadge
) => {
  switch (transactionStatus) {
    case "failure":
      return I18n.t("global.badges.failed");
    case "cancelled":
      return I18n.t("global.badges.cancelled");
    case "reversal":
      return I18n.t("global.badges.reversal");
    case "pending":
      return I18n.t("global.badges.onGoing");
    default:
      return "";
  }
};

/**
 * Check if the given payment method is expired
 * right(true) if it is expired, right(false) if it is still valid
 * left if expiring date can't be evaluated
 * @param paymentMethod
 */
export const isPaymentMethodExpired = (paymentMethod: WalletInfo): boolean => {
  switch (paymentMethod.details?.type) {
    case TypeEnum.PAYPAL:
      return false;
    case TypeEnum.CARDS:
      const cardDetails = paymentMethod.details as WalletInfoDetails1;
      return isExpiredDate(cardDetails.expiryDate);
  }
  return false;
};

/**
 * true if the given paymentMethod supports the given walletFunction
 * @param paymentMethod
 * @param walletFunction
 */
export const hasServiceEnabled = (
  paymentMethod: WalletInfo | undefined,
  walletService: ServiceNameEnum
): boolean =>
  paymentMethod !== undefined &&
  paymentMethod.services.some(
    service =>
      service.name === walletService &&
      service.status === ServiceStatusEnum.ENABLED
  );
/**
 * return true if the payment method has the payment feature
 */
export const hasPaymentFeature = (paymentMethod: WalletInfo): boolean =>
  hasServiceEnabled(paymentMethod, ServiceNameEnum.PAGOPA);

/**
 * Check if a payment method is supported or not
 * If the payment method have the enableable function pagoPA, can always pay ("available")
 * "available" -> can pay
 * "arriving" -> will pay
 * "notAvailable" -> can't pay
 * "onboardableNotImplemented" -> can onboard a card that can pay but is not yet implemented
 */
export const isPaymentSupported = (
  paymentMethod: WalletInfo
): PaymentSupportStatus => {
  const paymentSupported: O.Option<PaymentSupportStatus> = hasPaymentFeature(
    paymentMethod
  )
    ? O.some("available")
    : O.none;

  const notAvailableCustomRepresentation = O.some(
    "notAvailable" as PaymentSupportStatus
  );

  return pipe(
    paymentSupported,
    O.alt(() => notAvailableCustomRepresentation),
    O.getOrElseW(() => "notAvailable" as const)
  );
};

export const getPaymentLogo = (
  selectedMethod: WalletInfoDetails
): IOLogoPaymentType | undefined => {
  switch (selectedMethod.type) {
    case TypeEnum.CARDS:
      const cardsType = selectedMethod as WalletInfoDetails1;
      const { brand } = cardsType;
      return pipe(
        brand,
        findFirstCaseInsensitive(IOPaymentLogos),
        O.fold(
          () => undefined,
          ([logoName, _]) => logoName
        )
      ) as IOLogoPaymentType;
    case TypeEnum.PAYPAL:
      return "payPal";
    default:
      return undefined;
  }
};

export const WALLET_PAYMENT_TERMS_AND_CONDITIONS_URL =
  "https://www.pagopa.gov.it/it/prestatori-servizi-di-pagamento/elenco-PSP-attivi/";
