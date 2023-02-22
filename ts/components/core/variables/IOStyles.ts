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
  },
  centerJustified: {
    justifyContent: "center"
  },
  // The following styles come from the original
  // NativeBase's `View`. They are moved here to
  // prevent UI regressions.
  footer: {
    backgroundColor: themeVariables.footerBackground,
    paddingBottom: themeVariables.footerPaddingBottom,
    paddingLeft: themeVariables.footerPaddingLeft,
    paddingRight: themeVariables.footerPaddingRight,
    paddingTop: themeVariables.footerPaddingTop,
    // iOS shadow
    shadowColor: themeVariables.footerShadowColor,
    shadowOffset: {
      width: themeVariables.footerShadowOffsetWidth,
      height: themeVariables.footerShadowOffsetHeight
    },
    shadowOpacity: themeVariables.footerShadowOpacity,
    shadowRadius: themeVariables.footerShadowRadius,
    // Android shadow
    elevation: themeVariables.footerElevation
  }
});

/**
 * BUTTON STYLES
 */

export const IOButtonStyles = StyleSheet.create({
  /* Labels */
  label: {
    alignSelf: "center"
  },
  labelSizeDefault: {
    fontSize: 16
  },
  labelSizeSmall: {
    fontSize: 14
  },
  /* Heights
  Must be replaced with dynamic values, depending on the
  fontScale parameter */
  buttonSizeDefault: {
    height: 40
  },
  buttonSizeSmall: {
    height: 39
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
