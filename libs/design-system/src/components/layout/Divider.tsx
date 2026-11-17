import { StyleSheet, View } from "react-native";

import { useIOColors } from "../../context";

const DEFAULT_BORDER_SIZE = StyleSheet.hairlineWidth;

/** Horizontal `Divider` component */
export const Divider = () => {
  const dividerColors = useIOColors().component.divider;

  return (
    <View
      style={{
        backgroundColor: dividerColors.border,
        height: DEFAULT_BORDER_SIZE
      }}
    />
  );
};
