import { BoxShadowValue, StyleSheet } from "react-native";

import { hexToRgba, IOColorsLegacy } from "./IOColors";
import { IODimensions } from "./tokens";

const { padding, radius, size, stroke } = IODimensions;

/** A collection of default styles used within IO App. */

/** Shared footer `boxShadow` */
export const footerBoxShadow = {
  offsetX: 0,
  offsetY: 0,
  blurRadius: 32,
  color: hexToRgba(IOColorsLegacy.black, 0.1)
} satisfies BoxShadowValue;

export const IOStyles = StyleSheet.create({
  // The following styles come from the original
  // NativeBase's `View`. They are moved here to
  // prevent UI regressions.
  footer: {
    backgroundColor: IOColorsLegacy.white,
    paddingBottom: padding.footer.vertical,
    paddingHorizontal: padding.screen.default,
    paddingTop: padding.footer.vertical,
    boxShadow: [footerBoxShadow]
  }
});

export const IOIconButtonStyles = StyleSheet.create({
  /* IconButton */
  button: {
    alignItems: "center",
    justifyContent: "center"
  },
  buttonSizeSmall: {
    width: size.iconButton.small,
    height: size.iconButton.small
  },
  buttonSizeLarge: {
    width: size.iconButton.large,
    height: size.iconButton.large,
    borderRadius: size.iconButton.large
  }
});

/** LIST ITEM STYLES */

export const IOListItemStyles = StyleSheet.create({
  listItem: {
    paddingVertical: padding.listItem.default.vertical,
    paddingHorizontal: padding.listItem.default.horizontal,
    marginHorizontal: -padding.listItem.default.horizontal
  },
  listItemInner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between"
  }
});

export const IOModuleStyles = StyleSheet.create({
  button: {
    borderWidth: stroke.default,
    borderColor: IOColorsLegacy["grey-100"],
    borderRadius: radius.module,
    borderCurve: "continuous",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: padding.module.vertical,
    paddingHorizontal: padding.module.horizontal
  }
});

/** SELECTION ITEM STYLES */

export const IOSelectionListItemStyles = StyleSheet.create({
  listItem: {
    paddingVertical: padding.listItem.default.vertical,
    paddingHorizontal: padding.listItem.default.horizontal,
    marginHorizontal: -padding.listItem.default.horizontal
  },
  listItemInner: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between"
  }
});
