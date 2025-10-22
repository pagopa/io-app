import {
  IOLogoPaymentType,
  IOPaymentLogos,
  ListItemTransactionBadge
} from "@pagopa/io-app-design-system";
import * as O from "fp-ts/lib/Option";
import { pipe } from "fp-ts/lib/function";
import _ from "lodash";
import I18n from "i18next";
import { Bundle } from "../../../../../definitions/pagopa/ecommerce/Bundle";
import { WalletApplicationStatusEnum } from "../../../../../definitions/pagopa/walletv3/WalletApplicationStatus";
import { WalletInfo } from "../../../../../definitions/pagopa/walletv3/WalletInfo";
import { PaymentSupportStatus } from "../../../../types/paymentMethodCapabilities";
import { getDateFromExpiryDate, isExpiredDate } from "../../../../utils/dates";
import { WalletPaymentPspSortType } from "../../checkout/types";
import { PaymentCardProps } from "../components/PaymentCard";
import { UIWalletInfoDetails } from "../types/UIWalletInfoDetails";
import { NoticeListItem } from "../../../../../definitions/pagopa/biz-events/NoticeListItem";
import { findFirstCaseInsensitive } from "../../../../utils/object";
import { WalletCard } from "../../../wallet/types";
import { contentRepoUrl } from "../../../../config";
import { LevelEnum } from "../../../../../definitions/content/SectionStatus";
import { AlertVariant, ListItemTransactionStatus } from "./types";

export const TRANSACTION_LOGO_CDN = `${contentRepoUrl}/logos/organizations`;

/**
 * A simple function to get the corresponding translated badge text,
 * based on the transaction status.
 */

export const getBadgePropsByTransactionStatus = (
  transactionStatus: ListItemTransactionStatus
): ListItemTransactionBadge => {
  switch (transactionStatus) {
    case "failure":
      return {
        text: I18n.t("global.badges.failed"),
        variant: "error"
      };
    case "cancelled":
      return {
        text: I18n.t("global.badges.cancelled"),
        variant: "default"
      };
    case "reversal":
      return {
        text: I18n.t("global.badges.reversal"),
        variant: "default"
      };
    case "pending":
      return {
        text: I18n.t("global.badges.onGoing"),
        variant: "highlight"
      };
    default:
      return {
        text: "",
        variant: "default"
      };
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
  "https://www.pagopa.gov.it/it/prestatori-servizi-di-pagamento/trasparenza-bancaria/";

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
      return _.orderBy(pspList, psp => psp.pspBusinessName);
    case "amount":
      return _.orderBy(
        pspList,
        ["taxPayerFee", "pspBusinessName"],
        ["asc", "asc"]
      );
    case "default":
    default:
      return _.orderBy(
        pspList,
        [psp => (psp.onUs ? 1 : 0), "taxPayerFee", "pspBusinessName"],
        ["desc", "asc", "asc"]
      );
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
      // eslint-disable-next-line @typescript-eslint/no-shadow
      O.map(([logoName, _]) => logoName as IOLogoPaymentType),
      O.toUndefined
    );
  }
};

export const getTransactionLogo = (transaction: NoticeListItem) =>
  pipe(
    transaction.payeeTaxCode,
    O.fromNullable,
    O.map(
      taxCode => `${TRANSACTION_LOGO_CDN}/${taxCode.replace(/^0+/, "")}.png`
    )
  );

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

/**
 * Function that returns the alert variant based on the given LevelEnum provided
 * by the backend config file
 */
export const getAlertVariant = (level: LevelEnum): AlertVariant => {
  switch (level) {
    case LevelEnum.critical:
      return "error";
    case LevelEnum.normal:
      return "info";
    case LevelEnum.warning:
      return "warning";
    default:
      return "info";
  }
};
