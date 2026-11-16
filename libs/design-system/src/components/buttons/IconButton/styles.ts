import { StyleSheet } from "react-native";

import { IODimensions } from "../../../core/tokens";

export const iconButtonStyles = StyleSheet.create({
  button: {
    alignItems: "center",
    justifyContent: "center"
  },
  size: {
    width: IODimensions.size.iconButton.small,
    height: IODimensions.size.iconButton.small
  }
});
