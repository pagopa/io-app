import _ from "lodash";
import * as O from "fp-ts/lib/Option";
import { ListItemTransactionStatusWithBadge } from "@pagopa/io-app-design-system";
import I18n from "i18n-js";
import { pipe } from "fp-ts/lib/function";

import { WalletInfo } from "../../../../../definitions/pagopa/walletv3/WalletInfo";
import { isExpiredDate } from "../../../../utils/dates";
import { ServiceNameEnum } from "../../../../../definitions/pagopa/walletv3/ServiceName";
import { PaymentSupportStatus } from "../../../../types/paymentMethodCapabilities";
import {
  TypeEnum,
  WalletInfoDetails1
} from "../../../../../definitions/pagopa/walletv3/WalletInfoDetails";
import { Bundle } from "../../../../../definitions/pagopa/ecommerce/Bundle";
import { WalletPaymentPspSortType } from "../../payment/types";

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
  paymentMethod.services.some(service => service.name === walletService);
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

/**
 * Function that returns a sorted list of psp based on the given sortType
 * The sortType can be: "name", "amount" or "default"
 */
export const getSortedPspList = (
  pspList: ReadonlyArray<Bundle>,
  sortType: WalletPaymentPspSortType
) => {
  switch (sortType) {
    case "name":
      return _.sortBy(pspList, psp => psp.bundleName);
    case "amount":
      return _.sortBy(pspList, psp => psp.taxPayerFee, ["desc"]);
    case "default":
    default:
      return _.sortBy(pspList, psp => psp.taxPayerFee);
  }
};
