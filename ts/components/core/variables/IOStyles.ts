import { StyleSheet, TextStyle } from "react-native";
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
    paddingHorizontal: themeVariables.contentPadding
  },
  row: {
    flexDirection: "row"
  },
  column: {
    flexDirection: "column"
  },
  rowSpaceBetween: {
    flexDirection: "row",
    justifyContent: "space-between"
  }
});

/**
 * BUTTON STYLES
 */

/* Font Size */
const btnFontSizeDefault: TextStyle["fontSize"] = 16;
const btnFontSizeSmall: TextStyle["fontSize"] = 14;
/* Height */
const btnHeightDefault: TextStyle["height"] = 40;
const btnHeightSmall: TextStyle["height"] = 39;

export const IOButtonStyles = StyleSheet.create({
  /* Labels */
  label: {
    alignSelf: "center"
  },
  labelSizeDefault: {
    fontSize: btnFontSizeDefault
  },
  labelSizeSmall: {
    fontSize: btnFontSizeSmall
  },
  /* Heights
  Must be replaced with dynamic values, depending on the
  fontScale parameter */
  buttonSizeDefault: {
    height: btnHeightDefault
  },
  buttonSizeSmall: {
    height: btnHeightSmall
  },
  /* Widths */
  dimensionsDefault: {
    alignSelf: "flex-start"
  },
  dimensionsFullWidth: {
    flex: 1,
    alignSelf: "auto"
  }
});
