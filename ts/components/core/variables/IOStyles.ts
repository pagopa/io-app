import { Platform, StyleSheet } from "react-native";
import themeVariables from "../../../theme/variables";
import { IOIconSizeScale } from "../icons";
import { IOColors } from "./IOColors";
import { IOAppMargin, IOSpacingScale } from "./IOSpacing";

/**
 * A collection of default styles used within IO App.
 */

interface IOLayoutCostants {
  appMarginDefault: IOAppMargin;
}

export const IOLayoutCostants: IOLayoutCostants = {
  appMarginDefault: 24
};

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

/**
 * BUTTON STYLES
 */

/* SIZE
- Height for classic buttons
- Width and height for icon buttons
*/
const btnLegacySizeDefault = 40;
const btnLegacySizeSmall = 39;
const btnSizeLarge = 56;
// NEW Design System
const btnBorderRadius = 8;
const btnSizeDefault = 48;
// TODO: Replace the number type with the new IOIconSizeScale
const iconBtnSizeSmall: number = 24;

export const IOButtonLegacyStyles = StyleSheet.create({
  /* BaseButton, used in the:
  ButtonSolid, ButtonOutline
  */
  button: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    textAlignVertical: "center", // Prop supported on Android only
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
    height: btnLegacySizeDefault
  },
  buttonSizeSmall: {
    height: btnLegacySizeSmall
  }
});

export const IOButtonStyles = StyleSheet.create({
  /* BaseButton, used in the:
  ButtonSolid, ButtonOutline
  */
  button: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    textAlignVertical: "center", // Prop supported on Android only
    /* Legacy visual properties. They will be replaced with
    dynamic ones once NativeBase is gone */
    borderRadius: btnBorderRadius,
    paddingHorizontal: 24,
    // Reset default visual parameters
    elevation: 0
    // Visual parameters based on the FontScale
    // paddingVertical: PixelRatio.getFontScale() * 10,
    // paddingHorizontal: PixelRatio.getFontScale() * 16,
    // borderRadius: PixelRatio.getFontScale() * 8
  },
  buttonLink: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    textAlignVertical: "center", // Prop supported on Android only
    // Reset default visual parameters
    elevation: 0
  },
  /* Labels */
  label: {
    alignSelf: "center"
  },
  labelSizeDefault: {
    fontSize: 16
  },
  labelSizeSmall: {
    fontSize: 16
  },
  /* Heights
  Must be replaced with dynamic values, depending on the
  fontScale parameter */
  buttonSizeDefault: {
    height: btnSizeDefault
  },
  buttonSizeSmall: {
    height: btnSizeDefault
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
  buttonSizeSmall: {
    width: iconBtnSizeSmall,
    height: iconBtnSizeSmall
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

/**
 * LIST ITEM STYLES
 */

interface IOListItemVisualParams {
  paddingVertical: IOSpacingScale;
  paddingHorizontal: IOAppMargin;
  iconMargin: IOSpacingScale;
  iconSize: IOIconSizeScale;
  chevronSize: IOIconSizeScale;
}

export const IOListItemVisualParams: IOListItemVisualParams = {
  paddingVertical: 12,
  paddingHorizontal: IOLayoutCostants.appMarginDefault,
  iconMargin: 16,
  iconSize: 24,
  chevronSize: 24
};

export const IOListItemStyles = StyleSheet.create({
  listItem: {
    paddingVertical: IOListItemVisualParams.paddingVertical,
    paddingHorizontal: IOListItemVisualParams.paddingHorizontal,
    marginRight: -IOListItemVisualParams.paddingHorizontal,
    marginLeft: -IOListItemVisualParams.paddingHorizontal
  },
  listItemInner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between"
  }
});
