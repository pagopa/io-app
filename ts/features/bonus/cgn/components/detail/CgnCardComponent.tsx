import * as React from "react";
import { View } from "native-base";
import WebView from "react-native-webview";
import { StyleSheet } from "react-native";
import { IOStyles } from "../../../../../components/core/variables/IOStyles";
import { H5 } from "../../../../../components/core/typography/H5";
import { playSvg } from "./CardSvgPayload";

const styles = StyleSheet.create({
  cardContainer: {
    shadowColor: "#000",
    shadowOpacity: 0.29,
    shadowRadius: 4.65,
    height: 192
  },
  cgnCard: {
    position: "absolute",
    width: "100%",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 7
    },
    zIndex: 7,
    elevation: 7
  },
  informationContainer: {
    position: "absolute",
    zIndex: 9,
    elevation: 9
  }
});

const CgnCardComponent: React.FunctionComponent = () => (
  <View style={[IOStyles.horizontalContentPadding, styles.cgnCard]}>
    <View style={[styles.cardContainer]}>
      <WebView source={{ html: playSvg }} />
    </View>
    <View style={styles.informationContainer}>
      <View style={IOStyles.horizontalContentPadding}>
        <H5>{"TEST"}</H5>
      </View>
    </View>
  </View>
);

export default CgnCardComponent;
