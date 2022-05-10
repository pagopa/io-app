import React from "react";
import { CompatNavigationProp } from "@react-navigation/compat";
import { SafeAreaView, ScrollView, StyleSheet } from "react-native";
import { IOStackNavigationProp } from "../../../navigation/params/AppParamsList";
import { WalletParamsList } from "../../../navigation/params/WalletParamsList";
import BaseScreenComponent from "../../../components/screens/BaseScreenComponent";
import I18n from "../../../i18n";
import { emptyContextualHelp } from "../../../utils/emptyContextualHelp";
import FooterWithButtons from "../../../components/ui/FooterWithButtons";

const styles = StyleSheet.create({
  container: {
    flex: 1
  }
});

type Props = {
  navigation: CompatNavigationProp<
    IOStackNavigationProp<WalletParamsList, "PAYMENT_TRANSACTION_SUMMARY">
  >;
};

export const NewTransactionSummaryScreen = (
  props: Props
): React.ReactElement => (
  <BaseScreenComponent
    goBack={true}
    contextualHelp={emptyContextualHelp}
    headerTitle={I18n.t("wallet.ConfirmPayment.paymentInformations")}
  >
    <SafeAreaView style={styles.container}>
      <ScrollView></ScrollView>
      <FooterWithButtons
        type="SingleButton"
        leftButton={{
          block: true,
          onPress: () => {},
          title: I18n.t("global.buttons.continue")
        }}
      />
    </SafeAreaView>
  </BaseScreenComponent>
);
