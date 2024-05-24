/* eslint-disable functional/immutable-data */
import { capitalize } from "lodash";
import * as React from "react";
import { StyleSheet, View } from "react-native";
import Placeholder from "rn-placeholder";
import {
  Divider,
  IORadiusScale,
  IOVisualCostants,
  ListItemHeader,
  ListItemInfo,
  ListItemInfoCopy,
  VSpacer
} from "@pagopa/io-app-design-system";
import { IOStyles } from "../../../../components/core/variables/IOStyles";
import I18n from "../../../../i18n";
import { format } from "../../../../utils/dates";
import { clipboardSetStringWithFeedback } from "../../../../utils/clipboard";
import TransactionReceiptDivider from "../../../../../img/features/wallet/transaction-receipt-divider.svg";
import { TransactionDetailResponse } from "../../../../../definitions/pagopa/biz-events/TransactionDetailResponse";
import { WalletInfo } from "../../../../../definitions/pagopa/biz-events/WalletInfo";

type PaymentsBizEventsTransactionInfoSectionProps = {
  transaction?: TransactionDetailResponse;
  loading?: boolean;
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    ...IOStyles.horizontalContentPadding
  },
  contentCard: {
    ...IOStyles.horizontalContentPadding,
    ...IOStyles.bgWhite,
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
  const transactionInfo = transaction?.infoTransaction;
  return (
    <>
      <TransactionReceiptDivider
        height={24}
        width={"100%"}
        preserveAspectRatio="xMin slice"
      />
      <View style={styles.container}>
        <View style={styles.contentCard}>
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
                    value={`${transactionInfo.payer.name}\n(${transactionInfo.payer.taxCode})`}
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
              {transactionInfo.transactionDate && (
                <>
                  <ListItemInfo
                    label={I18n.t("transaction.details.info.dateAndHour")}
                    value={format(
                      new Date(transactionInfo.transactionDate),
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
              {transactionInfo.transactionId && (
                <ListItemInfoCopy
                  onPress={() =>
                    clipboardSetStringWithFeedback(
                      transactionInfo.transactionId ?? ""
                    )
                  }
                  accessibilityLabel={`${I18n.t(
                    "transaction.details.info.transactionId"
                  )}: ${transactionInfo.transactionId}`}
                  label={I18n.t("transaction.details.info.transactionId")}
                  value={transactionInfo.transactionId}
                />
              )}
            </>
          )}
        </View>
      </View>
    </>
  );
};

const renderPaymentMethod = (walletInfo: WalletInfo) => {
  if (walletInfo.blurredNumber) {
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
        paymentLogoIcon={walletInfo.brand}
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
