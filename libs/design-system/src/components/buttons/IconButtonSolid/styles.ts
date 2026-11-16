import { StyleSheet } from "react-native";

import { IODimensions } from "../../../core/tokens";

export const iconButtonSolidStyles = StyleSheet.create({
  button: {
    alignItems: "center",
    justifyContent: "center"
  },
  size: {
    width: IODimensions.size.iconButton.large,
    height: IODimensions.size.iconButton.large,
    borderRadius: IODimensions.size.iconButton.large
  }
});
