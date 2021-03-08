import * as React from "react";
import { View } from "native-base";
import WebView from "react-native-webview";
import { StyleSheet } from "react-native";
import { playSvg } from "./CardSvgPayload";

const styles = StyleSheet.create({
  cardContainer: {
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 7
    },
    shadowOpacity: 0.29,
    shadowRadius: 4.65,
    height: 192,
    width: "100%",
    top: 30,
    zIndex: 7,
    elevation: 7
  }
});

const CgnCardComponent: React.FunctionComponent = () => (
  <View style={styles.cardContainer}>
    <WebView source={{ html: playSvg(1000) }} />
  </View>
);

export default CgnCardComponent;
