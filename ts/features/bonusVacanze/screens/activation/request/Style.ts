import { StyleSheet } from "react-native";
import themeVariables from "../../../../../theme/variables";

export const activateBonusStyle = StyleSheet.create({
  horizontalPadding: {
    paddingLeft: themeVariables.contentPadding,
    paddingRight: themeVariables.contentPadding
  },
  row: {
    flexDirection: "row"
  },
  boxText: {
    fontSize: themeVariables.fontSizeSmall,
    flex: 1
  }
});
