import { Platform, StyleSheet } from "react-native";
import { IOColors, IOVisualCostants } from "@pagopa/io-app-design-system";
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
  selfCenter: {
    alignSelf: "center"
  },
  alignCenter: {
    alignItems: "center"
  },
  horizontalContentPadding: {
    paddingHorizontal: IOVisualCostants.appMarginDefault
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
    elevation: themeVariables.footerElevation // Prop supported on Android only
  },
  bgWhite: {
    backgroundColor: IOColors.white
    // https://github.com/pagopa/io-app/pull/4387
  },
  topListBorderBelowTabsStyle: {
    borderTopWidth: Platform.OS === "android" ? 0.1 : undefined,
    elevation: 0.1
  }
});
