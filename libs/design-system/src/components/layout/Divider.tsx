import { StyleSheet, View } from "react-native";

import { useIOTheme } from "../../context";
import { IOColorsLegacy } from "../../core/IOColors";

const DEFAULT_BORDER_SIZE = StyleSheet.hairlineWidth;

/** Horizontal `Divider` component */
export const Divider = () => {
  const theme = useIOTheme();

  return (
    <View
      style={{
        backgroundColor: IOColorsLegacy[theme["divider-default"]],
        height: DEFAULT_BORDER_SIZE
      }}
    />
  );
};
