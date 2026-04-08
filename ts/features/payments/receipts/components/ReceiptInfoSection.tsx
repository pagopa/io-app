import {
  Alert,
  ContentWrapper,
  Divider,
  IOColors,
  IOLogoPaymentType,
  IORadiusScale,
  IOSkeleton,
  IOVisualCostants,
  ListItemHeader,
  ListItemInfo,
  ListItemInfoCopy,
  useIOTheme,
  VSpacer
} from "@pagopa/io-app-design-system";
import I18n from "i18next";
import { capitalize } from "lodash";
import { View } from "react-native";

import { NoticeDetailResponse } from "../../../../../definitions/pagopa/biz-events/NoticeDetailResponse";
import { WalletInfo } from "../../../../../definitions/pagopa/biz-events/WalletInfo";
import { clipboardSetStringWithFeedback } from "../../../../utils/clipboard";
import { format } from "../../../../utils/dates";
import { capitalizeTextName } from "../../../../utils/strings";
import { PaymentListItemInfo } from "../../common/components/PaymentListItemInfo";
import { getPayerInfoLabel, isValidPspName, removeAsterisks } from "../utils";
import { ReceiptDivider } from "./ReceiptDivider";

type Props = {
  loading?: boolean;
  showUnavailableReceiptBanner?: boolean;
  transaction?: NoticeDetailResponse;
};

/**
 * Component that shows the biz-events transaction info
 */
const ReceiptInfoSection = ({
  transaction,
  loading,
  showUnavailableReceiptBanner
}: Props) => {
  const theme = useIOTheme();
  const backgroundColor = IOColors[theme["appBackground-primary"]];

  const transactionInfo = transaction?.infoNotice;

  return (
    <>
      <ReceiptDivider />
      <ContentWrapper style={{ flexGrow: 1 }}>
        <ContentWrapper
          style={{
            borderRadius: IORadiusScale["1"],
            marginVertical: IOVisualCostants.appMarginDefault,
            backgroundColor
          }}
        >
          <ListItemHeader
            accessibilityLabel={I18n.t("transaction.details.info.title")}
            label={I18n.t("transaction.details.info.title")}
          />
          {loading && (
            <>
              <SkeletonItem />
              <Divider />
              <SkeletonItem />
              <Divider />
              <SkeletonItem />
              <Divider />
              <SkeletonItem />
              <Divider />
              <SkeletonItem />
            </>
          )}
          {!loading && transactionInfo && (
            <>
              {transactionInfo.payer && (
                <>
                  <PaymentListItemInfo
                    label={I18n.t("transaction.details.info.executedBy")}
                    testID="payer-info"
                    value={getPayerInfoLabel(transactionInfo.payer)}
                  />
                  <Divider />
                </>
              )}
              {transactionInfo.paymentMethod && transactionInfo.walletInfo && (
                <>
                  {renderPaymentMethod(transactionInfo.walletInfo)}
                  <Divider />
                </>
              )}
              {(transactionInfo.walletInfo?.maskedEmail ||
                transactionInfo.walletInfo?.accountHolder) && (
                <>
                  <PaymentListItemInfo
                    label={I18n.t("transaction.details.info.headedTo")}
                    value={
                      transactionInfo.walletInfo?.maskedEmail ??
                      capitalizeTextName(
                        transactionInfo.walletInfo?.accountHolder ?? ""
                      )
                    }
                  />
                  <Divider />
                </>
              )}
              {transactionInfo.pspName &&
                isValidPspName(transactionInfo.pspName) && (
                  <>
                    <PaymentListItemInfo
                      label={I18n.t("transaction.details.info.pspName")}
                      value={transactionInfo.pspName}
                    />
                    <Divider />
                  </>
                )}
              {transactionInfo.noticeDate && (
                <>
                  <PaymentListItemInfo
                    label={I18n.t("transaction.details.info.dateAndHour")}
                    value={format(
                      new Date(transactionInfo.noticeDate),
                      "DD MMMM YYYY, HH:mm:ss"
                    )}
                  />
                  <Divider />
                </>
              )}
              {transactionInfo.rrn && (
                <>
                  <ListItemInfoCopy
                    accessibilityLabel={`${I18n.t(
                      "transaction.details.info.rrn"
                    )}: ${transactionInfo.rrn}`}
                    label={I18n.t("transaction.details.info.rrn")}
                    onPress={() =>
                      clipboardSetStringWithFeedback(transactionInfo.rrn ?? "")
                    }
                    value={transactionInfo.rrn}
                  />
                  <Divider />
                </>
              )}
              {transactionInfo.authCode && (
                <>
                  <ListItemInfoCopy
                    accessibilityLabel={`${I18n.t(
                      "transaction.details.info.authCode"
                    )}: ${transactionInfo.authCode}`}
                    label={I18n.t("transaction.details.info.authCode")}
                    onPress={() =>
                      clipboardSetStringWithFeedback(
                        transactionInfo.authCode ?? ""
                      )
                    }
                    value={transactionInfo.authCode}
                  />
                  <Divider />
                </>
              )}
              {transactionInfo.eventId && (
                <ListItemInfoCopy
                  accessibilityLabel={`${I18n.t(
                    "transaction.details.info.transactionId"
                  )}: ${transactionInfo.eventId}`}
                  label={I18n.t("transaction.details.info.transactionId")}
                  onPress={() =>
                    clipboardSetStringWithFeedback(
                      transactionInfo.eventId ?? ""
                    )
                  }
                  value={transactionInfo.eventId}
                />
              )}
            </>
          )}
        </ContentWrapper>
        {showUnavailableReceiptBanner && (
          <>
            <Alert
              content={I18n.t("transaction.details.bannerImported.content")}
              variant="info"
            />
            <VSpacer size={12} />
          </>
        )}
      </ContentWrapper>
    </>
  );
};

const renderPaymentMethod = (walletInfo: WalletInfo) => {
  if (walletInfo.blurredNumber && walletInfo.brand) {
    return (
      <PaymentListItemInfo
        accessibilityLabel={I18n.t("wallet.methodDetails.a11y.credit.hpan", {
          circuit: walletInfo.brand,
          // we space the hpan to make the screen reader read it digit by digit
          spacedHpan: removeAsterisks(walletInfo.blurredNumber)
            .split("")
            .join(" ")
        })}
        label={I18n.t("transaction.details.info.paymentMethod")}
        paymentLogoIcon={walletInfo.brand as IOLogoPaymentType}
        value={`${capitalize(walletInfo.brand)} •••• ${removeAsterisks(
          walletInfo.blurredNumber
        )}`}
      />
    );
  }
  if (walletInfo.maskedEmail) {
    return (
      <ListItemInfo
        label={I18n.t("transaction.details.info.paymentMethod")}
        paymentLogoIcon={"payPal"}
        value="PayPal"
      />
    );
  }
  return <></>;
};

const SkeletonItem = () => (
  <View style={{ flex: 1, paddingVertical: 12 }} testID="skeleton-item">
    <IOSkeleton height={16} radius={4} shape="rectangle" width="80%" />
    <VSpacer size={8} />
    <IOSkeleton height={16} radius={4} shape="rectangle" width="25%" />
  </View>
);

export default ReceiptInfoSection;
