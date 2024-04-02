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
import { getHistoryList } from "../utils/paymentsHomeScreenHistoryGenerator";
import { useIONavigation } from "../../../../navigation/params/AppParamsList";
import { PaymentsCheckoutRoutes } from "../../checkout/navigation/routes";

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
  const navigation = useIONavigation();
  const historyPot = useIOSelector(walletTransactionHistorySelector);
  const renderItems = pot.isLoading(historyPot)
    ? getLoadingHistory()
    : getHistoryList(pot.getOrElse(historyPot, {}));

  const handleOnPayNoticedPress = () => {
    navigation.navigate(PaymentsCheckoutRoutes.PAYMENT_CHECKOUT_NAVIGATOR, {
      screen: PaymentsCheckoutRoutes.PAYMENT_CHECKOUT_INPUT_NOTICE_NUMBER
    });
  };

  return (
    // full pages history loading will be handled by history details page
    <>
      <ListItemHeader
        label={I18n.t("payment.homeScreen.historySection.header")}
        accessibilityLabel={I18n.t("payment.homeScreen.historySection.header")}
        endElement={{
          type: "buttonLink",
          componentProps: {
            label: I18n.t("payment.homeScreen.historySection.headerCTA"),
            onPress: () => null
          }
        }}
      />
      {renderItems}
    </>
  );
};

export default PaymentHistorySection;
