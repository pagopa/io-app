import {
  Alert,
  Divider,
  IOColors,
  IORadiusScale,
  IOVisualCostants,
  ListItemHeader,
  ListItemInfo,
  ListItemInfoCopy,
  useIOTheme,
  VSpacer
} from "@pagopa/io-app-design-system";
import * as React from "react";
import { StyleSheet, View } from "react-native";
import Svg, { Path } from "react-native-svg";
import Placeholder from "rn-placeholder";
import { IOStyles } from "../../../../components/core/variables/IOStyles";
import I18n from "../../../../i18n";
import { useIOSelector } from "../../../../store/hooks";
import { isDesignSystemEnabledSelector } from "../../../../store/reducers/persistedPreferences";
import { Psp, Transaction } from "../../../../types/pagopa";
import { clipboardSetStringWithFeedback } from "../../../../utils/clipboard";
import { format } from "../../../../utils/dates";

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
  const theme = useIOTheme();
  const backgroundColor = IOColors[theme["appBackground-primary"]];

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
