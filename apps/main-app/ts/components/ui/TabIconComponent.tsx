import { AnimatedIcon, IONavIcons } from "@io-app/design-system";
import { memo } from "react";
import { ColorValue, View } from "react-native";

type TabIconComponent = {
  color?: ColorValue;
  focused: boolean;
  iconName: IONavIcons;
  iconNameFocused: IONavIcons;
};

/**
 *  Generic tab icon with badge indicator
 */

export const TabIconComponent = memo(
  ({ focused, iconName, iconNameFocused, color }: TabIconComponent) => (
    // accessibilityLabel={""} in order to read the font icon, without modify the library element
    <View accessibilityLabel={""}>
      <AnimatedIcon
        color={color}
        name={focused ? iconNameFocused : iconName}
        size={24}
      />
    </View>
  )
);
