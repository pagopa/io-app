import { HSpacer } from "@pagopa/io-app-design-system";
import * as React from "react";
import { Image, StyleSheet, View } from "react-native";
import maestro from "../../../img/wallet/cards-icons/maestro.png";
import mastercard from "../../../img/wallet/cards-icons/mastercard.png";
import vpay from "../../../img/wallet/cards-icons/vPay.png";
import visaElectron from "../../../img/wallet/cards-icons/visa-electron.png";
import visa from "../../../img/wallet/cards-icons/visa.png";

const styles = StyleSheet.create({
  brandLogo: {
    width: 40,
    height: 25,
    resizeMode: "contain"
  },
  row: {
    flexDirection: "row"
  }
});

const InternationalCircuitIconsBar: React.FunctionComponent = () => (
  <View style={styles.row} testID={"internationalCircuitIconsBar"}>
    <Image
      accessibilityIgnoresInvertColors
      source={maestro}
      style={styles.brandLogo}
      testID={"maestro"}
    />
    <HSpacer size={16} />
    <Image
      accessibilityIgnoresInvertColors
      source={mastercard}
      style={styles.brandLogo}
      testID={"mastercard"}
    />
    <HSpacer size={16} />
    <Image
      accessibilityIgnoresInvertColors
      source={visa}
      style={styles.brandLogo}
      testID={"visa"}
    />
    <HSpacer size={16} />
    <Image
      accessibilityIgnoresInvertColors
      source={visaElectron}
      style={styles.brandLogo}
      testID={"visaElectron"}
    />
    <HSpacer size={16} />
    <Image
      accessibilityIgnoresInvertColors
      source={vpay}
      style={styles.brandLogo}
      testID={"vPay"}
    />
  </View>
);

export default InternationalCircuitIconsBar;
