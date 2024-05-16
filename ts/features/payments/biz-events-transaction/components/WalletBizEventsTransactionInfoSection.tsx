/* eslint-disable functional/immutable-data */
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

type WalletBizEventsTransactionInfoSectionProps = {
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
const WalletBizEventsTransactionInfoSection = ({
  transaction,
  loading
}: WalletBizEventsTransactionInfoSectionProps) => {
  const transactionInfo = transaction?.infoTransaction;
  return (
    <>
      <TransactionReceiptDivider
        height={24}
        width={"100%"}
        preserveAspectRatio="xMin slice" // Add this property to fit the width to the parent
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
                    label="Eseguito da"
                    value={`${transactionInfo.payer.name}\n(${transactionInfo.payer.taxCode})`}
                  />
                  <Divider />
                </>
              )}
              {/* {transactionInfo.paymentMethod && transactionInfo.walletInfo && renderPaymentMethod(transactionInfo.paymentMethod, transactionInfo.walletInfo)} */}
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
                    accessibilityLabel={`RRN: ${transactionInfo.rrn}`}
                    label="RRN"
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
                    accessibilityLabel={`Codice autorizzativo: ${transactionInfo.authCode}`}
                    label="Codice autorizzativo"
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

// const renderPaymentMethod = (paymentMethod: String, walletInfo: WalletInfo) => {
//   switch (paymentMethod) {
//     case "PPAL":
//       return (
//         <>
//           <ListItemTransaction
//           title="Metodo di pagamento"
//           subtitle={walletInfo.}
//             label={I18n.t("transaction.details.info.paymentMethod")}
//             value={I18n.t("transaction.details.info.paymentMethodPayPal")}
//           />
//           <Divider />
//         </>
//       );
// }

const SkeletonItem = () => (
  <View style={[IOStyles.flex, { paddingVertical: 12 }]}>
    <Placeholder.Box height={16} width="80%" radius={4} />
    <VSpacer size={8} />
    <Placeholder.Box height={16} width="25%" radius={4} />
  </View>
);

export default WalletBizEventsTransactionInfoSection;
