import { Platform, StyleSheet } from "react-native";
import { makeFontStyleObject } from "../../../theme/fonts";
import variables from "../../../theme/variables";

export const CreditCardStyles = StyleSheet.create({
  largeTextStyle: {
    ...makeFontStyleObject(Platform.select, undefined, false, "RobotoMono"),
    fontSize: variables.fontSize4
  },
  rowStyle: {
    alignItems: "center"
  },
  textStyle: {
    fontFamily: variables.fontFamily,
    color: variables.cardFontColor
  },
  smallTextStyle: {
    fontSize: variables.fontSize2,
    color: variables.brandDarkGray
  }
});
