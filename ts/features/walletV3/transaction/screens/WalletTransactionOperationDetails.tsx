import * as React from "react";
import { SafeAreaView } from "react-native";
import { H1, IOStyles } from "@pagopa/io-app-design-system";
import * as pot from "@pagopa/ts-commons/lib/pot";
import * as O from "fp-ts/lib/Option";
import { pipe } from "fp-ts/lib/function";
import { useNavigation } from "@react-navigation/native";

import { WalletTransactionStackNavigation } from "../navigation/navigator";
import { useIODispatch, useIOSelector } from "../../../../store/hooks";
import TopScreenComponent from "../../../../components/screens/TopScreenComponent";

const WalletTransactionOperationDetailsScreen = () => {
  const navigation = useNavigation<WalletTransactionStackNavigation>();
  const dispatch = useIODispatch();

  return (
    <TopScreenComponent goBack>
      <SafeAreaView style={IOStyles.flex}>
        <H1>WalletTransactionOperationDetailsScreen</H1>
      </SafeAreaView>
    </TopScreenComponent>
  );
};

export default WalletTransactionOperationDetailsScreen;
