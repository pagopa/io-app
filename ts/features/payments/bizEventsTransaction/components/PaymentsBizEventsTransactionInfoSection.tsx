import { capitalize } from "lodash";
import * as React from "react";
import { StyleSheet, View } from "react-native";
import Placeholder from "rn-placeholder";
import {
  Alert,
  Divider,
  IOColors,
  IOLogoPaymentType,
  IORadiusScale,
  IOVisualCostants,
  ListItemHeader,
  ListItemInfo,
  ListItemInfoCopy,
  useIOTheme,
  VSpacer
} from "@pagopa/io-app-design-system";
import Svg, { Path } from "react-native-svg";
import { IOStyles } from "../../../../components/core/variables/IOStyles";
import I18n from "../../../../i18n";
import { format } from "../../../../utils/dates";
import { clipboardSetStringWithFeedback } from "../../../../utils/clipboard";
import { WalletInfo } from "../../../../../definitions/pagopa/biz-events/WalletInfo";
import { getPayerInfoLabel } from "../utils";
import { NoticeDetailResponse } from "../../../../../definitions/pagopa/biz-events/NoticeDetailResponse";
import { OriginEnum } from "../../../../../definitions/pagopa/biz-events/InfoNotice";

type PaymentsBizEventsTransactionInfoSectionProps = {
  transaction?: NoticeDetailResponse;
  loading?: boolean;
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    ...IOStyles.horizontalContentPadding
  },
  contentCard: {
    ...IOStyles.horizontalContentPadding,
    borderRadius: IORadiusScale["1"],
    marginVertical: IOVisualCostants.appMarginDefault
  }
});

/**
 * Component that shows the biz-events transaction info
 */
const PaymentsBizEventsTransactionInfoSection = ({
  transaction,
  loading
}: PaymentsBizEventsTransactionInfoSectionProps) => {
  const theme = useIOTheme();
  const backgroundColor = IOColors[theme["appBackground-primary"]];

  const transactionInfo = transaction?.infoNotice;

  return (
    <>
      {/* TransactionReceiptDivider */}
      <Svg
        width="100%"
        height="24"
        viewBox="0 0 360 24"
        preserveAspectRatio="xMin slice"
        fill="none"
      >
        <Path
          d="M0 0H360V20.5645L348.75 24L337.5 20.5645L326.25 24L315 20.5645L303.75 24L292.5 20.5645L281.25 24L270 20.5645L258.75 24L247.5 20.5645L236.25 24L225 20.5645L213.75 24L202.5 20.5645L191.25 24L180 20.5645L168.75 24L157.5 20.5645L146.25 24L135 20.5645L123.75 24L112.5 20.5645L101.25 24L90 20.5645L78.75 24L67.5 20.5645L56.25 24L45 20.5645L33.75 24L22.5 20.5645L11.25 24L0 20.5645L0 0Z"
          fill={IOColors[theme["appBackground-primary"]]}
        />
      </Svg>
      <View style={styles.container}>
        <View style={[styles.contentCard, { backgroundColor }]}>
          <ListItemHeader
            label={I18n.t("transaction.details.info.title")}
            accessibilityLabel={I18n.t("transaction.details.info.title")}
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
                  <ListItemInfo
                    label={I18n.t("transaction.details.info.executedBy")}
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
                  <ListItemInfo
                    label={I18n.t("transaction.details.info.headedTo")}
                    value={
                      transactionInfo.walletInfo?.maskedEmail ??
                      transactionInfo.walletInfo?.accountHolder
                    }
                  />
                  <Divider />
                </>
              )}
              {transactionInfo.pspName && (
                <>
                  <ListItemInfo
                    label={I18n.t("transaction.details.info.pspName")}
                    value={transactionInfo.pspName}
                  />
                  <Divider />
                </>
              )}
              {transactionInfo.noticeDate && (
                <>
                  <ListItemInfo
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
                    onPress={() =>
                      clipboardSetStringWithFeedback(transactionInfo.rrn ?? "")
                    }
                    accessibilityLabel={`${I18n.t(
                      "transaction.details.info.rrn"
                    )}: ${transactionInfo.rrn}`}
                    label={I18n.t("transaction.details.info.rrn")}
                    value={transactionInfo.rrn}
                  />
                  <Divider />
                </>
              )}
              {transactionInfo.authCode && (
                <>
                  <ListItemInfoCopy
                    onPress={() =>
                      clipboardSetStringWithFeedback(
                        transactionInfo.authCode ?? ""
                      )
                    }
                    accessibilityLabel={`${I18n.t(
                      "transaction.details.info.authCode"
                    )}: ${transactionInfo.authCode}`}
                    label={I18n.t("transaction.details.info.authCode")}
                    value={transactionInfo.authCode}
                  />
                  <Divider />
                </>
              )}
              {transactionInfo.eventId && (
                <ListItemInfoCopy
                  onPress={() =>
                    clipboardSetStringWithFeedback(
                      transactionInfo.eventId ?? ""
                    )
                  }
                  accessibilityLabel={`${I18n.t(
                    "transaction.details.info.transactionId"
                  )}: ${transactionInfo.eventId}`}
                  label={I18n.t("transaction.details.info.transactionId")}
                  value={transactionInfo.eventId}
                />
              )}
            </>
          )}
        </View>
        {transactionInfo?.origin === OriginEnum.PM && (
          <Alert
            variant="info"
            content={I18n.t("transaction.details.bannerImported.content")}
          />
        )}
      </View>
    </>
  );
};

const renderPaymentMethod = (walletInfo: WalletInfo) => {
  if (walletInfo.blurredNumber && walletInfo.brand) {
    return (
      <ListItemInfo
        label={I18n.t("transaction.details.info.paymentMethod")}
        value={`${capitalize(walletInfo.brand)} •••• ${
          walletInfo.blurredNumber
        }`}
        accessibilityLabel={I18n.t("wallet.methodDetails.a11y.credit.hpan", {
          circuit: walletInfo.brand,
          // we space the hpan to make the screen reader read it digit by digit
          spacedHpan: walletInfo.blurredNumber.split("").join(" ")
        })}
        paymentLogoIcon={walletInfo.brand as IOLogoPaymentType}
      />
    );
  }
  if (walletInfo.maskedEmail) {
    return (
      <ListItemInfo
        label={I18n.t("transaction.details.info.paymentMethod")}
        value="PayPal"
        paymentLogoIcon={"payPal"}
      />
    );
  }
  return <></>;
};

const SkeletonItem = () => (
  <View style={[IOStyles.flex, { paddingVertical: 12 }]}>
    <Placeholder.Box height={16} width="80%" radius={4} />
    <VSpacer size={8} />
    <Placeholder.Box height={16} width="25%" radius={4} />
  </View>
);

export default PaymentsBizEventsTransactionInfoSection;
