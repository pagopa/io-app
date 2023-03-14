import { Platform, StyleSheet } from "react-native";
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
  },
  // https://github.com/pagopa/io-app/pull/4387
  topListBorderBelowTabsStyle: {
    borderTopWidth: Platform.OS === "android" ? 0.1 : undefined,
    elevation: 0.1
  }
});

/**
 * BUTTON STYLES
 */

/* SIZE
- Height for classic buttons
- Width and height for icon buttons
*/
const btnSizeDefault = 40;
const btnSizeSmall = 39;
const btnSizeLarge = 56;

export const IOButtonStyles = StyleSheet.create({
  /* BaseButton, used in the:
  ButtonSolid, ButtonOutline
  */
  button: {
    alignItems: "center",
    textAlignVertical: "center", // Android
    justifyContent: "center",
    /* Legacy visual properties. They will be replaced with
    dynamic ones once NativeBase is gone */
    borderRadius: themeVariables.btnBorderRadius,
    paddingHorizontal: 16,
    // Reset default visual parameters
    elevation: 0
    // Visual parameters based on the FontScale
    // paddingVertical: PixelRatio.getFontScale() * 10,
    // paddingHorizontal: PixelRatio.getFontScale() * 16,
    // borderRadius: PixelRatio.getFontScale() * 8
  },
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
    height: btnSizeDefault
  },
  buttonSizeSmall: {
    height: btnSizeSmall
  },
  /* Widths */
  dimensionsDefault: {
    alignSelf: "flex-start"
  }
});

export const IOIconButtonStyles = StyleSheet.create({
  /* IconButton */
  button: {
    alignItems: "center",
    justifyContent: "center",
    // Reset default visual parameters
    elevation: 0
  },
  buttonSizeDefault: {
    width: btnSizeDefault,
    height: btnSizeDefault,
    borderRadius: btnSizeDefault
  },
  buttonSizeLarge: {
    width: btnSizeLarge,
    height: btnSizeLarge,
    borderRadius: btnSizeLarge
  }
});
