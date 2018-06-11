import { StyleSheet, Platform } from "react-native";
import variables from '../../../theme/variables';
import { makeFontStyleObject } from '../../../theme/fonts';

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
})