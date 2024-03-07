import {
  GradientScrollView,
  IOStyles,
  ListItemHeader,
  ListItemTransaction
} from "@pagopa/io-app-design-system";
import * as pot from "@pagopa/ts-commons/lib/pot";
import * as React from "react";
import { View } from "react-native";
import I18n from "../../../../i18n";
import { useIOSelector } from "../../../../store/hooks";
import { walletTransactionHistorySelector } from "../store/selectors";
import { getHistoryList } from "./PaymentsHomeScreenHistoryList";

const getLoadingHistory = () =>
  Array.from({ length: 5 }).map((_, index) => (
    <ListItemTransaction
      isLoading={true}
      key={index}
      transactionStatus="success"
      transactionAmount=""
      title=""
      subtitle=""
    />
  ));

const PaymentHistorySection = () => {
  const historyPot = useIOSelector(walletTransactionHistorySelector);
  const renderItems = pot.isLoading(historyPot)
    ? getLoadingHistory()
    : getHistoryList(pot.getOrElse(historyPot, {}));

  return (
    // full pages history loading will be handled by history details page
    <>
      <View style={IOStyles.horizontalContentPadding}>
        <ListItemHeader
          label={I18n.t("payment.homeScreen.historySection.header")}
          accessibilityLabel={I18n.t(
            "payment.homeScreen.historySection.header"
          )}
          endElement={{
            type: "buttonLink",
            componentProps: {
              label: I18n.t("payment.homeScreen.historySection.headerCTA"),
              onPress: () => null
            }
          }}
        />
      </View>
      <GradientScrollView
        primaryActionProps={{
          accessibilityLabel: I18n.t("payment.homeScreen.CTA"),
          label: I18n.t("payment.homeScreen.CTA"),
          onPress: () => null,
          icon: "qrCode",
          iconPosition: "end"
        }}
      >
        {renderItems}
      </GradientScrollView>
    </>
  );
};

export default PaymentHistorySection;
