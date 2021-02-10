import { Platform, StyleSheet } from "react-native";
import { makeFontStyleObject as deprecatedMakeFontStyleObject } from "../../../theme/fonts";
import variables from "../../../theme/variables";
import { makeFontStyleObject } from "../../core/fonts";

export const CreditCardStyles = StyleSheet.create({
  largeTextStyle: {
    ...deprecatedMakeFontStyleObject(
      Platform.select,
      undefined,
      false,
      "RobotoMono"
    ),
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
    color: variables.cardExpiredTextColor,
    fontWeight: makeFontStyleObject("Bold").fontWeight
  }
});
