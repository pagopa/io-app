import { StyleSheet } from "react-native";
import variables from "../../../theme/variables";
import { makeFontStyleObject } from "../../core/fonts";

export const CreditCardStyles = StyleSheet.create({
  largeTextStyle: {
    ...makeFontStyleObject(undefined),
    fontSize: variables.fontSizeBase * 1.125 // 18
  },
  rowStyle: {
    alignItems: "center"
  },
  textStyle: {
    fontFamily: variables.fontFamily,
    color: variables.cardFontColor
  },
  smallTextStyle: {
    color: variables.brandDarkGray
  },
  expiredTextStyle: {
    fontSize: variables.fontSize1,
    color: variables.cardExpiredTextColor
  }
});
