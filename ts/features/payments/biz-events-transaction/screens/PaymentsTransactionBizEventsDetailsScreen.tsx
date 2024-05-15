import { IOColors } from "@pagopa/io-app-design-system";
import * as pot from "@pagopa/ts-commons/lib/pot";
import { RouteProp, useRoute } from "@react-navigation/native";
import * as React from "react";
import { Dimensions, StyleSheet, View } from "react-native";
import FocusAwareStatusBar from "../../../../components/ui/FocusAwareStatusBar";
import { RNavScreenWithLargeHeader } from "../../../../components/ui/RNavScreenWithLargeHeader";
import I18n from "../../../../i18n";
import { useIODispatch, useIOSelector } from "../../../../store/hooks";
import { emptyContextualHelp } from "../../../../utils/emptyContextualHelp";
import { useOnFirstRender } from "../../../../utils/hooks/useOnFirstRender";
import { WalletBizEventsTransactionHeadingSection } from "../components/WalletBizEventsTransactionHeadingSection";
import WalletTransactionInfoSection from "../components/WalletBizEventsTransactionInfoSection";
import { PaymentsTransactionBizEventsParamsList } from "../navigation/params";
import { getPaymentsBizEventsTransactionDetailsAction } from "../store/actions";
import { walletTransactionBizEventsDetailsPotSelector } from "../store/selectors";

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
  const route = useRoute<PaymentsTransactionBizEventsDetailsScreenProps>();
  const { transactionId } = route.params;
  const transactionDetailsPot = useIOSelector(
    walletTransactionBizEventsDetailsPotSelector
  );

  const isLoading = pot.isLoading(transactionDetailsPot);
  const transactionDetails = pot.toUndefined(transactionDetailsPot);

  useOnFirstRender(() => {
    dispatch(
      getPaymentsBizEventsTransactionDetailsAction.request({ transactionId })
    );
  });

  return (
    <RNavScreenWithLargeHeader
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
        <WalletBizEventsTransactionHeadingSection
          transaction={transactionDetails}
          psp={transactionPsp}
          isLoading={isLoading}
        />
        <WalletTransactionInfoSection
          transaction={transactionDetails}
          psp={transactionPsp}
          loading={isLoading}
        />
      </View>
    </RNavScreenWithLargeHeader>
  );
};

export { PaymentsTransactionBizEventsDetailsScreen };
