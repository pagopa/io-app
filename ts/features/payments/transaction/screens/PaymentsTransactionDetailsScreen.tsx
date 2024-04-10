import { IOColors } from "@pagopa/io-app-design-system";
import * as pot from "@pagopa/ts-commons/lib/pot";
import { RouteProp, useRoute } from "@react-navigation/native";
import * as React from "react";
import { Dimensions, StyleSheet, View } from "react-native";
import FocusAwareStatusBar from "../../../../components/ui/FocusAwareStatusBar";
import { RNavScreenWithLargeHeader } from "../../../../components/ui/RNavScreenWithLargeHeader";
import I18n from "../../../../i18n";
import { fetchPsp } from "../../../../store/actions/wallet/transactions";
import { useIODispatch, useIOSelector } from "../../../../store/hooks";
import { Psp } from "../../../../types/pagopa";
import { emptyContextualHelp } from "../../../../utils/emptyContextualHelp";
import { useOnFirstRender } from "../../../../utils/hooks/useOnFirstRender";
import { WalletTransactionHeadingSection } from "../components/WalletTransactionHeadingSection";
import WalletTransactionInfoSection from "../components/WalletTransactionInfoSection";
import { PaymentsTransactionParamsList } from "../navigation/params";
import { getPaymentsTransactionDetailsAction } from "../store/actions";
import { walletTransactionDetailsPotSelector } from "../store/selectors";

export type PaymentsTransactionDetailsScreenParams = {
  transactionId: number;
};

export type PaymentsTransactionDetailsScreenProps = RouteProp<
  PaymentsTransactionParamsList,
  "PAYMENT_TRANSACTION_DETAILS"
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

const PaymentsTransactionDetailsScreen = () => {
  const [transactionPsp, setTransactionPsp] = React.useState<Psp | undefined>();
  const dispatch = useIODispatch();
  const route = useRoute<PaymentsTransactionDetailsScreenProps>();
  const { transactionId } = route.params;
  const transactionDetailsPot = useIOSelector(
    walletTransactionDetailsPotSelector
  );

  const isLoading = pot.isLoading(transactionDetailsPot);
  const transactionDetails = pot.toUndefined(transactionDetailsPot);

  useOnFirstRender(() => {
    dispatch(getPaymentsTransactionDetailsAction.request({ transactionId }));
  });

  React.useEffect(() => {
    if (transactionDetails?.idPsp !== undefined) {
      dispatch(
        fetchPsp.request({
          idPsp: transactionDetails.idPsp,
          onSuccess: ({ payload }) => {
            setTransactionPsp(payload.psp);
          }
        })
      );
    }
  }, [dispatch, transactionDetails]);

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
        <WalletTransactionHeadingSection
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

export { PaymentsTransactionDetailsScreen };
