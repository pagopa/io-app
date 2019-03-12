import { Platform, StyleSheet } from "react-native";
import { makeFontStyleObject } from "../../../theme/fonts";
import variables from "../../../theme/variables";

export const CreditCardStyles = StyleSheet.create({
  largeTextStyle: {
    ...makeFontStyleObject(Platform.select, undefined, false, "RobotoMono"),
    fontSize: variables.fontSize3
  },
  rowStyle: {
    alignItems: "center"
  },
  textStyle: {
    fontFamily: variables.fontFamily,
    color: variables.cardFontColor
  },
  smallTextStyle: {
    fontSize: variables.fontSizeSmall,
    color: variables.brandDarkGray
  }
});
