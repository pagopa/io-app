import { BodySmall } from "@pagopa/io-app-design-system";
import I18n from "i18next";
import { StyleSheet, View } from "react-native";
import { ItWalletLogo } from "./ItWalletLogo";

export const PoweredByItWalletText = () => (
  <View style={styles.poweredBy} testID="poweredByItWalletTextTestID">
    <BodySmall>
      {I18n.t("features.itWallet.presentation.credentialDetails.partOf")}
    </BodySmall>
    <ItWalletLogo width={80} height={16} accessibilityLabel="IT Wallet" />
  </View>
);

const styles = StyleSheet.create({
  poweredBy: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8
  }
});
