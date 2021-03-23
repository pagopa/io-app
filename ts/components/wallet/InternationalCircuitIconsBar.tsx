import * as React from "react";
import { View } from "native-base";
import { Image, StyleSheet } from "react-native";
import maestro from "../../../img/wallet/cards-icons/maestro.png";
import mastercard from "../../../img/wallet/cards-icons/mastercard.png";
import visaElectron from "../../../img/wallet/cards-icons/visa-electron.png";
import visa from "../../../img/wallet/cards-icons/visa.png";
import vpay from "../../../img/wallet/cards-icons/vPay.png";

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
    <Image source={maestro} style={styles.brandLogo} testID={"maestro"} />
    <View hspacer={true} />
    <Image source={mastercard} style={styles.brandLogo} testID={"mastercard"} />
    <View hspacer={true} />
    <Image source={visa} style={styles.brandLogo} testID={"visa"} />
    <View hspacer={true} />
    <Image
      source={visaElectron}
      style={styles.brandLogo}
      testID={"visaElectron"}
    />
    <View hspacer={true} />
    <Image source={vpay} style={styles.brandLogo} testID={"vPay"} />
  </View>
);

export default InternationalCircuitIconsBar;
