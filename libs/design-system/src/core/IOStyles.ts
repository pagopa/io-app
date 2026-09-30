import { BoxShadowValue, StyleSheet } from "react-native";

import { IOIconSizeScale } from "../components/icons";
import { hexToRgba, IOColors } from "./IOColors";
import { IOModuleIDPRadius } from "./IOShapes";
import {
  IOAppMargin,
  IOModuleIDPHSpacing,
  IOModuleIDPVSpacing,
  IOSpacer,
  IOSpacingScale
} from "./IOSpacing";

/** A collection of default styles used within IO App. */

interface IOVisualCostants {
  appMarginDefault: IOAppMargin;
  avatarRadiusSizeMedium: number;
  avatarRadiusSizeSmall: number;
  avatarSizeMedium: number;
  // Dimensions
  avatarSizeSmall: number;
  // Header
  headerHeight: number;
  iconContainedSizeDefault: number;
  iconMargin: IOSpacingScale;
  scrollDownButtonBottom: number;
  scrollDownButtonRight: number;
}

export const IOVisualCostants: IOVisualCostants = {
  appMarginDefault: 24,
  headerHeight: 56,
  avatarSizeSmall: 44,
  avatarSizeMedium: 66,
  avatarRadiusSizeSmall: 8,
  avatarRadiusSizeMedium: 12,
  iconContainedSizeDefault: 44,
  scrollDownButtonRight: 24,
  scrollDownButtonBottom: 24,
  iconMargin: 12
};

/** Shared footer `boxShadow` */
export const footerBoxShadow = {
  offsetX: 0,
  offsetY: 0,
  blurRadius: 32,
  color: hexToRgba(IOColors.black, 0.1)
} satisfies BoxShadowValue;

export const IOStyles = StyleSheet.create({
  // The following styles come from the original
  // NativeBase's `View`. They are moved here to
  // prevent UI regressions.
  footer: {
    backgroundColor: IOColors.white,
    paddingBottom: 16,
    paddingHorizontal: IOVisualCostants.appMarginDefault,
    paddingTop: 16,
    boxShadow: [footerBoxShadow]
  }
});

/** BUTTON STYLES */

/* SIZE
- Height for classic buttons
- Width and height for icon buttons
*/
const btnSizeLarge = 56;
// NEW Design System
const btnBorderRadius = 8;
const btnSizeDefault = 48;
export const buttonSolidHeight: number = btnSizeDefault;

// TODO: Replace the number type with the new IOIconSizeScale
export const iconBtnSizeSmall = 24;

export const IOButtonStyles = StyleSheet.create({
  /* BaseButton, used in the:
  ButtonSolid, ButtonOutline
  */
  /* DELETE THIS, ONCE WE REMOVE `ButtonSolid`, `ButtonOutline` COMPONENTS */
  button: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    textAlignVertical: "center", // Prop supported on Android only
    /* Legacy visual properties. They will be replaced with
    dynamic ones once NativeBase is gone */
    borderRadius: btnBorderRadius,
    borderCurve: "continuous",
    paddingHorizontal: 24
    // Visual parameters based on the FontScale
    // paddingVertical: PixelRatio.getFontScale() * 10,
    // paddingHorizontal: PixelRatio.getFontScale() * 16,
    // borderRadius: PixelRatio.getFontScale() * 8
  },
  buttonInner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center"
  },
  buttonLink: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    textAlignVertical: "center" // Prop supported on Android only
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
  }
});

export const IOIconButtonStyles = StyleSheet.create({
  /* IconButton */
  button: {
    alignItems: "center",
    justifyContent: "center"
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

/** LIST ITEM STYLES */

interface IOListItemVisualParams {
  actionMargin: IOSpacingScale;
  chevronSize: IOIconSizeScale;
  iconMargin: IOSpacingScale;
  iconSize: IOIconSizeScale;
  paddingHorizontal: IOAppMargin;
  paddingVertical: IOSpacingScale;
}

export const IOListItemVisualParams: IOListItemVisualParams = {
  paddingVertical: 12,
  paddingHorizontal: IOVisualCostants.appMarginDefault,
  iconMargin: IOVisualCostants.iconMargin,
  actionMargin: 16,
  iconSize: 24,
  chevronSize: 24
};

export const IOListItemStyles = StyleSheet.create({
  listItem: {
    paddingVertical: IOListItemVisualParams.paddingVertical,
    paddingHorizontal: IOListItemVisualParams.paddingHorizontal,
    marginHorizontal: -IOListItemVisualParams.paddingHorizontal
  },
  listItemInner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between"
  }
});

export const IOModuleStyles = StyleSheet.create({
  button: {
    borderWidth: 1,
    borderColor: IOColors["grey-100"],
    borderRadius: IOModuleIDPRadius,
    borderCurve: "continuous",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: IOModuleIDPVSpacing,
    paddingHorizontal: IOModuleIDPHSpacing
  }
});

/** SELECTION ITEM STYLES */

interface IOSelectionTickVisualParams {
  borderWidth: number;
  size: IOIconSizeScale;
}

export const IOSelectionTickVisualParams: IOSelectionTickVisualParams = {
  size: 24,
  borderWidth: 2
};

interface IOSelectionListItemVisualParams {
  actionMargin: IOSpacer;
  descriptionMargin: IOSpacer;
  iconMargin: IOSpacingScale;
  iconSize: IOIconSizeScale;
  paddingHorizontal: IOAppMargin;
  paddingVertical: IOSpacingScale;
}

export const IOSelectionListItemVisualParams: IOSelectionListItemVisualParams =
  {
    paddingVertical: 16,
    paddingHorizontal: IOVisualCostants.appMarginDefault,
    iconMargin: IOVisualCostants.iconMargin,
    iconSize: 24,
    actionMargin: 8,
    descriptionMargin: 4
  };

export const IOSelectionListItemStyles = StyleSheet.create({
  listItem: {
    paddingVertical: IOListItemVisualParams.paddingVertical,
    paddingHorizontal: IOListItemVisualParams.paddingHorizontal,
    marginHorizontal: -IOListItemVisualParams.paddingHorizontal
  },
  listItemInner: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between"
  }
});
