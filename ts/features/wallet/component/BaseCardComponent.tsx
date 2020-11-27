import { View } from "native-base";
import * as React from "react";
import { Platform, StyleSheet } from "react-native";
import { widthPercentageToDP } from "react-native-responsive-screen";
import customVariables from "../../../theme/variables";

type Props = {
  topLeftCorner: React.ReactNode;
  bottomLeftCorner: React.ReactNode;
  bottomRightCorner: React.ReactNode;
};

const styles = StyleSheet.create({
  cardBox: {
    height: 192,
    width: widthPercentageToDP("90%"),
    maxWidth: 343,
    paddingHorizontal: customVariables.contentPadding,
    paddingTop: 20,
    paddingBottom: 22,
    flexDirection: "column",
    justifyContent: "space-between",
    backgroundColor: customVariables.brandGray,
    borderRadius: 8,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 3
    },
    shadowOpacity: 0.18,
    shadowRadius: 4.65,
    zIndex: 7,
    elevation: 7
  },
  shadowBox: {
    marginBottom: -13,
    borderRadius: 8,
    borderTopWidth: 10,
    borderTopColor: "rgba(0,0,0,0.1)",
    height: 15,
    width: widthPercentageToDP("90%"),
    maxWidth: 343
  },
  bottomRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center"
  },
  bancomatLogo: {
    width: 60,
    height: 36,
    resizeMode: "contain"
  }
});

/**
 * The base component that represents a full bancomat card
 * @param props
 * @constructor
 */
const BaseCardComponent: React.FunctionComponent<Props> = (props: Props) => (
  <>
    {Platform.OS === "android" && <View style={styles.shadowBox} />}
    <View style={styles.cardBox}>
      <View>{props.topLeftCorner}</View>
      <View style={styles.bottomRow}>
        {props.bottomLeftCorner}
        {props.bottomRightCorner}
      </View>
    </View>
  </>
);

export default BaseCardComponent;
