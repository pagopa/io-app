import * as React from "react";
import * as pot from "@pagopa/ts-commons/lib/pot";
import { Dimensions, Platform, StyleSheet, View } from "react-native";
import { IOColors } from "@pagopa/io-app-design-system";
import { RouteProp, useRoute } from "@react-navigation/native";

import { WalletTransactionParamsList } from "../navigation/navigator";
import { useIODispatch, useIOSelector } from "../../../../store/hooks";
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
    <RNavScreenWithLargeHeader
      title={I18n.t("transaction.details.title")}
      contextualHelp={emptyContextualHelp}
      faqCategories={["wallet_transaction"]}
      headerActionsProp={{ showHelp: true }}
    >
      <FocusAwareStatusBar barStyle={"dark-content"} />
      {/* The following line is used to show the background color gray that overlay the basic one which is whie */}
      <View style={styles.bottomBackground} />
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
    </RNavScreenWithLargeHeader>
  );
};

export default WalletTransactionDetailsScreen;
