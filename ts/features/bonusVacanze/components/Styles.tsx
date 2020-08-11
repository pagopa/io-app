import { StyleSheet } from "react-native";
import themeVariables from "../../../theme/variables";

/**
 * This file will contains the common styles for the bonus vacanze
 * TODO: Should be possible create a common subset of styles combination for the whole app,
 * instead of having only the constant defined in themeVariables
 */
const styles = StyleSheet.create({
  flex: {
    flex: 1
  },
  horizontalPadding: {
    paddingLeft: themeVariables.contentPadding,
    paddingRight: themeVariables.contentPadding
  },
  row: {
    flexDirection: "row"
  }
});

export const bonusVacanzeStyle = styles;
