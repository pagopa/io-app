/* eslint-disable functional/immutable-data */
import * as React from "react";
import { StyleSheet, View } from "react-native";
import {
  Divider,
  IOColors,
  IORadiusScale,
  IOVisualCostants,
  ListItemHeader,
  ListItemInfo,
  ListItemInfoCopy
} from "@pagopa/io-app-design-system";
import { IOStyles } from "../../../../components/core/variables/IOStyles";
import I18n from "../../../../i18n";
import { Psp, Transaction } from "../../../../types/pagopa";
import { format } from "../../../../utils/dates";
import { clipboardSetStringWithFeedback } from "../../../../utils/clipboard";
import TransactionReceiptDivider from "../../../../../img/features/wallet/transaction-receipt-divider.svg";

type WalletTransactionInfoSectionProps = {
  transaction: Transaction;
  psp?: Psp;
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: IOColors["grey-50"]
  },
  contentCard: {
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
  psp
}: WalletTransactionInfoSectionProps) => (
  <>
    <TransactionReceiptDivider
      height={24}
      width={"100%"}
      preserveAspectRatio="xMin slice" // Add this property to fit the width to the parent
    />
    <View
      style={[
        IOStyles.horizontalContentPadding,
        styles.container,
        IOStyles.flex
      ]}
    >
      <View
        style={[
          styles.contentCard,
          IOStyles.horizontalContentPadding,
          IOStyles.bgWhite
        ]}
      >
        <ListItemHeader
          label={I18n.t("transaction.details.info.title")}
          accessibilityLabel={I18n.t("transaction.details.info.title")}
        />
        {psp?.businessName && (
          <ListItemInfo
            accessibilityLabel={I18n.t("transaction.details.info.pspName")}
            label={I18n.t("transaction.details.info.pspName")}
            value={psp?.businessName}
          />
        )}
        <Divider />
        <ListItemInfo
          accessibilityLabel={I18n.t("transaction.details.info.dateAndHour")}
          label={I18n.t("transaction.details.info.dateAndHour")}
          value={format(transaction.created, "DD MMMM YYYY, HH:mm:ss")}
        />
        <Divider />
        <ListItemInfoCopy
          onPress={() =>
            clipboardSetStringWithFeedback(transaction.id.toString())
          }
          accessibilityLabel={I18n.t("transaction.details.info.transactionId")}
          label={I18n.t("transaction.details.info.transactionId")}
          value={transaction.id.toString()}
        />
      </View>
    </View>
  </>
);

export default WalletTransactionInfoSection;
