import { capitalize } from "lodash";
import * as React from "react";
import { StyleSheet, View } from "react-native";
import Placeholder from "rn-placeholder";
import {
  Alert,
  Divider,
  IOLogoPaymentType,
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
  const transactionInfo = transaction?.infoNotice;
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
            content="La ricevuta pagoPA non è disponibile. Rivolgiti all’Ente Creditore se hai bisogno della quietanza di pagamento, cioè il documento che attesta di aver saldato un debito."
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
