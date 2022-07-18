import { StyleSheet } from "react-native";
import variables from "../../../theme/variables";
import { makeFontStyleObject } from "../../core/fonts";
import { IOColors } from "../../core/variables/IOColors";

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
    color: IOColors.bluegrey
  },
  expiredTextStyle: {
    fontSize: variables.fontSize1,
    color: variables.cardExpiredTextColor
  }
});
