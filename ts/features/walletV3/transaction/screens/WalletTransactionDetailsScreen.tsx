import * as React from "react";
import * as pot from "@pagopa/ts-commons/lib/pot";
import {
  Dimensions,
  Platform,
  ScrollView,
  StyleSheet,
  View
} from "react-native";
import { IOColors, IOStyles } from "@pagopa/io-app-design-system";
import { RouteProp, useRoute } from "@react-navigation/native";

import { WalletTransactionParamsList } from "../navigation/navigator";
import { useIODispatch, useIOSelector } from "../../../../store/hooks";
import TopScreenComponent from "../../../../components/screens/TopScreenComponent";
import FocusAwareStatusBar from "../../../../components/ui/FocusAwareStatusBar";
import { emptyContextualHelp } from "../../../../utils/emptyContextualHelp";
import { useOnFirstRender } from "../../../../utils/hooks/useOnFirstRender";
import { walletTransactionDetailsGet } from "../store/actions";
import {
  walletTransactionDetailsPotSelector,
  walletTransactionDetailsSelector
} from "../store";
import { fetchPsp } from "../../../../store/actions/wallet/transactions";
import { Psp } from "../../../../types/pagopa";
import WalletTransactionInfoSection from "../components/WalletTransactionInfoSection";
import { WalletTransactionHeadingSection } from "../components/WalletTransactionHeadingSection";

export type WalletTransactionDetailsScreenParams = {
  transactionId: number;
};

export type WalletTransactionDetailsScreenProps = RouteProp<
  WalletTransactionParamsList,
  "WALLET_TRANSACTION_DETAILS"
>;

const styles = StyleSheet.create({
  iosHeaderScroll: {
    position: "absolute",
    height: Dimensions.get("window").height,
    top: -Dimensions.get("window").height,
    left: 0,
    right: 0,
    ...IOStyles.bgWhite
  },
  scrollViewContent: { backgroundColor: IOColors["grey-50"] }
});

const WalletTransactionDetailsScreen = () => {
  const dispatch = useIODispatch();
  const route = useRoute<WalletTransactionDetailsScreenProps>();
  const { transactionId } = route.params;
  const transactionDetailsPot = useIOSelector(
    walletTransactionDetailsPotSelector
  );

  const isLoading = pot.isLoading(transactionDetailsPot);

  const [transactionPsp, setTransactionPsp] = React.useState<Psp | undefined>();

  const transactionDetails = useIOSelector(walletTransactionDetailsSelector);

  useOnFirstRender(() => {
    dispatch(walletTransactionDetailsGet.request({ transactionId }));
  });

  React.useEffect(() => {
    if (transactionDetails && transactionDetails.idPsp) {
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
    <TopScreenComponent
      goBack
      contextualHelp={emptyContextualHelp}
      faqCategories={["wallet_transaction"]}
    >
      <FocusAwareStatusBar barStyle={"dark-content"} />
      <ScrollView style={styles.scrollViewContent}>
        {/* The following line is used to show the background color of the bounce effect on iOS the same color of the header */}
        {Platform.OS === "ios" && <View style={styles.iosHeaderScroll} />}
        <WalletTransactionHeadingSection
          transaction={transactionDetails}
          psp={transactionPsp}
          loading={isLoading}
        />
        <WalletTransactionInfoSection
          transaction={transactionDetails}
          psp={transactionPsp}
          loading={isLoading}
        />
      </ScrollView>
    </TopScreenComponent>
  );
};

export default WalletTransactionDetailsScreen;
