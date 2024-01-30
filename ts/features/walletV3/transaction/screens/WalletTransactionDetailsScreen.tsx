import * as React from "react";
import * as pot from "@pagopa/ts-commons/lib/pot";
import { Dimensions, StyleSheet, View } from "react-native";
import { IOColors } from "@pagopa/io-app-design-system";
import { RouteProp, useRoute } from "@react-navigation/native";

import { WalletTransactionParamsList } from "../navigation/navigator";
import { useIODispatch, useIOSelector } from "../../../../store/hooks";
import FocusAwareStatusBar from "../../../../components/ui/FocusAwareStatusBar";
import { emptyContextualHelp } from "../../../../utils/emptyContextualHelp";
import { useOnFirstRender } from "../../../../utils/hooks/useOnFirstRender";
import { walletTransactionDetailsGet } from "../store/actions";
import { walletTransactionDetailsPotSelector } from "../store";
import { fetchPsp } from "../../../../store/actions/wallet/transactions";
import { Psp } from "../../../../types/pagopa";
import WalletTransactionInfoSection from "../components/WalletTransactionInfoSection";
import { WalletTransactionHeadingSection } from "../components/WalletTransactionHeadingSection";
import { RNavScreenWithLargeHeader } from "../../../../components/ui/RNavScreenWithLargeHeader";
import I18n from "../../../../i18n";

export type WalletTransactionDetailsScreenParams = {
  transactionId: number;
};

export type WalletTransactionDetailsScreenProps = RouteProp<
  WalletTransactionParamsList,
  "WALLET_TRANSACTION_DETAILS"
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

const WalletTransactionDetailsScreen = () => {
  const [transactionPsp, setTransactionPsp] = React.useState<Psp | undefined>();
  const dispatch = useIODispatch();
  const route = useRoute<WalletTransactionDetailsScreenProps>();
  const { transactionId } = route.params;
  const transactionDetailsPot = useIOSelector(
    walletTransactionDetailsPotSelector
  );

  const isLoading = pot.isLoading(transactionDetailsPot);
  const transactionDetails = pot.toUndefined(transactionDetailsPot);

  useOnFirstRender(() => {
    dispatch(walletTransactionDetailsGet.request({ transactionId }));
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
        label: I18n.t("transaction.details.title"),
        accessibilityLabel: `${I18n.t("global.accessibility.inputLabel", {
          header: I18n.t("transaction.details.title")
        })}`
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

export default WalletTransactionDetailsScreen;
