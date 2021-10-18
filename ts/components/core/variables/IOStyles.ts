import { StyleSheet } from "react-native";
import themeVariables from "../../../theme/variables";

/**
 * A collection of default styles used within IO App.
 */

// TODO: in a first iteration, to avoid overlaps,
//  if a value already exists, will be used from themeVariables
export const IOStyles = StyleSheet.create({
  flex: {
    flex: 1
  },
  horizontalContentPadding: {
    paddingLeft: themeVariables.contentPadding,
    paddingRight: themeVariables.contentPadding
  },
  row: {
    flexDirection: "row"
  }
});
