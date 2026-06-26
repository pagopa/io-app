import { StyleSheet } from "react-native";
import { IOIconSizeScale } from "../components/icons";
import { IOColors } from "./IOColors";
import { IOModuleIDPRadius } from "./IOShapes";
import {
  IOAppMargin,
  IOModuleIDPHSpacing,
  IOModuleIDPVSpacing,
  IOSpacer,
  IOSpacingScale
} from "./IOSpacing";

/**
 * A collection of default styles used within IO App.
 */

interface IOVisualCostants {
  appMarginDefault: IOAppMargin;
  // Header
  headerHeight: number;
  // Dimensions
  avatarSizeSmall: number;
  avatarSizeMedium: number;
  avatarRadiusSizeSmall: number;
  avatarRadiusSizeMedium: number;
  iconContainedSizeDefault: number;
  scrollDownButtonRight: number;
  scrollDownButtonBottom: number;
  iconMargin: IOSpacingScale;
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

export const IOStyles = StyleSheet.create({
  // The following styles come from the original
  // NativeBase's `View`. They are moved here to
  // prevent UI regressions.
  footer: {
    backgroundColor: IOColors.white,
    paddingBottom: 16,
    paddingHorizontal: IOVisualCostants.appMarginDefault,
    paddingTop: 16,
    // iOS shadow
    shadowColor: IOColors.black,
    shadowOffset: {
      width: 0,
      height: 50
    },
    shadowOpacity: 0.5,
    shadowRadius: 37,
    elevation: 20 // Prop supported on Android only
  }
});

/**
 * BUTTON STYLES
 */

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
export const iconBtnSizeSmall: number = 24;

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
    paddingHorizontal: 24,
    // Reset default visual parameters
    elevation: 0
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

/**
 * LIST ITEM STYLES
 */

interface IOListItemVisualParams {
  paddingVertical: IOSpacingScale;
  paddingHorizontal: IOAppMargin;
  iconMargin: IOSpacingScale;
  actionMargin: IOSpacingScale;
  iconSize: IOIconSizeScale;
  chevronSize: IOIconSizeScale;
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

/**
 * SELECTION ITEM STYLES
 */

interface IOSelectionTickVisualParams {
  size: IOIconSizeScale;
  borderWidth: number;
}

export const IOSelectionTickVisualParams: IOSelectionTickVisualParams = {
  size: 24,
  borderWidth: 2
};

interface IOSelectionListItemVisualParams {
  paddingVertical: IOSpacingScale;
  paddingHorizontal: IOAppMargin;
  iconMargin: IOSpacingScale;
  actionMargin: IOSpacer;
  iconSize: IOIconSizeScale;
  descriptionMargin: IOSpacer;
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
