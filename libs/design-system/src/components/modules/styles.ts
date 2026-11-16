import { StyleSheet } from "react-native";

import { IODimensions } from "../../core/tokens";

const { padding, radius, stroke } = IODimensions;

export const IOModuleStyles = StyleSheet.create({
  button: {
    borderWidth: stroke.default,
    borderRadius: radius.module,
    borderCurve: "continuous",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: padding.module.vertical,
    paddingHorizontal: padding.module.horizontal
  }
});
