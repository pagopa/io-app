import { StyleSheet, View } from "react-native";
import { useIOTheme } from "../../context";
import { IOColors } from "../../core/IOColors";

const DEFAULT_BORDER_SIZE = StyleSheet.hairlineWidth;

/**
Horizontal `Divider` component
 */
export const Divider = () => {
  const theme = useIOTheme();

  return (
    <View
      style={{
        backgroundColor: IOColors[theme["divider-default"]],
        height: DEFAULT_BORDER_SIZE
      }}
    />
  );
};
