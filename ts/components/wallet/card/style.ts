import { StyleSheet } from "react-native";
import variables from "../../../theme/variables";

export const CreditCardStyles = StyleSheet.create({
  /* TODO: Evaluate removal of this legacy style.
  `cardTextColor` is a color variable used once in
  the relative card style */
  textStyle: {
    fontFamily: variables.fontFamily,
    color: variables.cardTextColor
  }
});
