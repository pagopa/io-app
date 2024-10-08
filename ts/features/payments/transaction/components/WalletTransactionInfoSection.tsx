import * as React from "react";
import { StyleSheet, View } from "react-native";
import Placeholder from "rn-placeholder";
import {
  Alert,
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
import { Psp, Transaction } from "../../../../types/pagopa";
import { format } from "../../../../utils/dates";
import { clipboardSetStringWithFeedback } from "../../../../utils/clipboard";
import TransactionReceiptDivider from "../../../../../img/features/wallet/transaction-receipt-divider.svg";
import { useIOSelector } from "../../../../store/hooks";
import { isDesignSystemEnabledSelector } from "../../../../store/reducers/persistedPreferences";

type WalletTransactionInfoSectionProps = {
  transaction?: Transaction;
  psp?: Psp;
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
 * Component that shows a success message after the wallet onboarding process is completed
 * TODO: Define the desired design of this component
 */
const WalletTransactionInfoSection = ({
  transaction,
  psp,
  loading
}: WalletTransactionInfoSectionProps) => {
  const isDesignSystemEnabled = useIOSelector(isDesignSystemEnabledSelector);
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
            </>
          )}
          {!loading && transaction && (
            <>
              {psp?.businessName && (
                <>
                  <ListItemInfo
                    label={I18n.t("transaction.details.info.pspName")}
                    value={psp.businessName}
                  />
                  <Divider />
                </>
              )}
              <ListItemInfo
                label={I18n.t("transaction.details.info.dateAndHour")}
                value={format(transaction.created, "DD MMMM YYYY, HH:mm:ss")}
                accessibilityLabel={`${I18n.t(
                  "transaction.details.info.dateAndHour"
                )}: ${format(transaction.created, "DD MMMM YYYY, HH:mm")}`}
              />
              <Divider />
              <ListItemInfoCopy
                onPress={() =>
                  clipboardSetStringWithFeedback(transaction.id.toString())
                }
                accessibilityLabel={`${I18n.t(
                  "transaction.details.info.transactionId"
                )}: ${transaction.id.toString()}`}
                label={I18n.t("transaction.details.info.transactionId")}
                value={transaction.id.toString()}
              />
            </>
          )}
        </View>
        {isDesignSystemEnabled && (
          <Alert
            content={I18n.t("transaction.details.info.alert.content")}
            variant="info"
          />
        )}
      </View>
    </>
  );
};

const SkeletonItem = () => (
  <View style={[IOStyles.flex, { paddingVertical: 12 }]}>
    <Placeholder.Box height={16} width="80%" radius={4} />
    <VSpacer size={8} />
    <Placeholder.Box height={16} width="25%" radius={4} />
  </View>
);

export default WalletTransactionInfoSection;
