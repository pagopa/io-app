import {
  IOLogoPaymentType,
  IOPaymentLogos,
  ListItemTransactionStatusWithBadge
} from "@pagopa/io-app-design-system";
import * as O from "fp-ts/lib/Option";
import { pipe } from "fp-ts/lib/function";
import I18n from "i18n-js";
import _ from "lodash";
import { Bundle } from "../../../../../definitions/pagopa/ecommerce/Bundle";
import { WalletApplicationStatusEnum } from "../../../../../definitions/pagopa/walletv3/WalletApplicationStatus";
import { WalletInfo } from "../../../../../definitions/pagopa/walletv3/WalletInfo";
import { PaymentSupportStatus } from "../../../../types/paymentMethodCapabilities";
import { getDateFromExpiryDate, isExpiredDate } from "../../../../utils/dates";
import { WalletPaymentPspSortType } from "../../checkout/types";
import { PaymentCardProps } from "../components/PaymentCard";
import { UIWalletInfoDetails } from "../types/UIWalletInfoDetails";
import { findFirstCaseInsensitive } from "../../../../utils/object";
import { WalletCard } from "../../../newWallet/types";

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
export const isPaymentMethodExpired = (
  details?: UIWalletInfoDetails
): boolean =>
  pipe(
    details?.expiryDate,
    O.fromNullable,
    O.chainNullableK(getDateFromExpiryDate),
    O.chainNullableK(isExpiredDate),
    O.getOrElse(() => false)
  );

/**
 * true if the given paymentMethod supports the given walletFunction
 * @param paymentMethod
 * @param walletFunction
 */
export const hasApplicationEnabled = (
  paymentMethod: WalletInfo | undefined,
  walletApplication: string
): boolean =>
  paymentMethod !== undefined &&
  paymentMethod.applications.some(
    application =>
      application.name === walletApplication &&
      application.status === WalletApplicationStatusEnum.ENABLED
  );
/**
 * return true if the payment method has the payment feature
 */
export const hasPaymentFeature = (paymentMethod: WalletInfo): boolean =>
  hasApplicationEnabled(paymentMethod, "PAGOPA");

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

export const WALLET_PAYMENT_TERMS_AND_CONDITIONS_URL =
  "https://www.pagopa.gov.it/it/prestatori-servizi-di-pagamento/elenco-PSP-attivi/";

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
      return _.orderBy(pspList, psp => psp.bundleName);
    case "amount":
      return _.orderBy(pspList, psp => psp.taxPayerFee);
    case "default":
    default:
      return _.orderBy(pspList, ["onUs", "taxPayerFee"]);
  }
};

export const getPaymentCardPropsFromWalletInfo = (
  wallet: WalletInfo
): PaymentCardProps => {
  const details = wallet.details as UIWalletInfoDetails;
  const isExpired = isPaymentMethodExpired(details);

  return {
    hpan: details.lastFourDigits,
    brand: details.brand,
    expireDate: getDateFromExpiryDate(details.expiryDate),
    holderEmail: details.maskedEmail,
    holderPhone: details.maskedNumber,
    isExpired
  };
};

export const getPaymentLogoFromWalletDetails = (
  details: UIWalletInfoDetails
): IOLogoPaymentType | undefined => {
  if (details.maskedEmail !== undefined) {
    return "payPal";
  } else if (details.maskedNumber !== undefined) {
    return "bancomatPay";
  } else {
    return pipe(
      details.brand,
      O.fromNullable,
      O.chain(findFirstCaseInsensitive(IOPaymentLogos)),
      O.map(([logoName, _]) => logoName as IOLogoPaymentType),
      O.toUndefined
    );
  }
};

export const mapWalletIdToCardKey = (walletId: string) => `method_${walletId}`;

export const mapWalletsToCards = (
  wallets: ReadonlyArray<WalletInfo>
): ReadonlyArray<WalletCard> =>
  wallets.map<WalletCard>(wallet => ({
    ...getPaymentCardPropsFromWalletInfo(wallet),
    key: mapWalletIdToCardKey(wallet.walletId),
    type: "payment",
    category: "payment",
    walletId: wallet.walletId
  }));

/**
 * Function that returns a formatted payment notice number
 * by placing two spaces between every four numbers
 */
export const formatPaymentNoticeNumber = (noticeNumber: string) =>
  noticeNumber.replace(/(\d{4})/g, "$1  ").trim();
