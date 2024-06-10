import { IOColors } from "@pagopa/io-app-design-system";
import * as pot from "@pagopa/ts-commons/lib/pot";
import { RouteProp, useRoute } from "@react-navigation/native";
import * as React from "react";
import { Dimensions, StyleSheet, View } from "react-native";
import FocusAwareStatusBar from "../../../../components/ui/FocusAwareStatusBar";
import I18n from "../../../../i18n";
import { useIODispatch, useIOSelector } from "../../../../store/hooks";
import { emptyContextualHelp } from "../../../../utils/emptyContextualHelp";
import { useOnFirstRender } from "../../../../utils/hooks/useOnFirstRender";
import { PaymentsBizEventsTransactionHeadingSection } from "../components/PaymentsBizEventsTransactionHeadingSection";
import WalletTransactionInfoSection from "../components/PaymentsBizEventsTransactionInfoSection";
import { PaymentsTransactionBizEventsParamsList } from "../navigation/params";
import { getPaymentsBizEventsTransactionDetailsAction } from "../store/actions";
import { walletTransactionBizEventsDetailsPotSelector } from "../store/selectors";
import { OperationResultScreenContent } from "../../../../components/screens/OperationResultScreenContent";
import { useIONavigation } from "../../../../navigation/params/AppParamsList";
import { IOScrollViewWithLargeHeader } from "../../../../components/ui/IOScrollViewWithLargeHeader";

export type PaymentsTransactionBizEventsDetailsScreenParams = {
  transactionId: string;
};

export type PaymentsTransactionBizEventsDetailsScreenProps = RouteProp<
  PaymentsTransactionBizEventsParamsList,
  "PAYMENT_TRANSACTION_BIZ_EVENTS_DETAILS"
>;

const windowHeight = Dimensions.get("window").height;

const styles = StyleSheet.create({
  bottomBackground: {
    position: "absolute",
    height: windowHeight,
    bottom: -windowHeight,
    left: 0,
    right: 0,
    backgroundColor: IOColors["grey-50"]
  },
  wrapper: {
    flexGrow: 1,
    alignContent: "flex-start",
    backgroundColor: IOColors["grey-50"]
  }
});

const PaymentsTransactionBizEventsDetailsScreen = () => {
  const dispatch = useIODispatch();
  const navigation = useIONavigation();
  const route = useRoute<PaymentsTransactionBizEventsDetailsScreenProps>();
  const { transactionId } = route.params;
  const transactionDetailsPot = useIOSelector(
    walletTransactionBizEventsDetailsPotSelector
  );

  const isLoading = pot.isLoading(transactionDetailsPot);
  const isError = pot.isError(transactionDetailsPot);
  const transactionDetails = pot.toUndefined(transactionDetailsPot);

  useOnFirstRender(() => {
    dispatch(
      getPaymentsBizEventsTransactionDetailsAction.request({ transactionId })
    );
  });

  // eslint-disable-next-line sonarjs/no-identical-functions
  const handleOnRetry = () => {
    dispatch(
      getPaymentsBizEventsTransactionDetailsAction.request({ transactionId })
    );
  };

  if (isError) {
    return (
      <OperationResultScreenContent
        pictogram="umbrellaNew"
        title={I18n.t("transaction.details.error.title")}
        action={{
          label: I18n.t("global.buttons.retry"),
          accessibilityLabel: I18n.t("global.buttons.retry"),
          onPress: handleOnRetry
        }}
        secondaryAction={{
          label: I18n.t("global.buttons.back"),
          accessibilityLabel: I18n.t("global.buttons.back"),
          onPress: navigation.goBack
        }}
      />
    );
  }

  return (
    <IOScrollViewWithLargeHeader
      title={{
        label: I18n.t("transaction.details.title")
      }}
      contextualHelp={emptyContextualHelp}
      faqCategories={["wallet_transaction"]}
      headerActionsProp={{ showHelp: true }}
    >
      <FocusAwareStatusBar barStyle={"dark-content"} />
      <View style={styles.wrapper}>
        {/* The following line is used to show the background color gray that overlay the basic one which is white */}
        <View style={styles.bottomBackground} />
        <PaymentsBizEventsTransactionHeadingSection
          transaction={transactionDetails}
          isLoading={isLoading}
        />
        <WalletTransactionInfoSection
          transaction={transactionDetails}
          loading={isLoading}
        />
      </View>
    </IOScrollViewWithLargeHeader>
  );
};

export { PaymentsTransactionBizEventsDetailsScreen };
