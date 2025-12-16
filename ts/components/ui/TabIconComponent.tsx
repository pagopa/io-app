import { ColorValue, View } from "react-native";
import { memo } from "react";
import { AnimatedIcon, IONavIcons } from "@pagopa/io-app-design-system";

type TabIconComponent = {
  focused: boolean;
  iconName: IONavIcons;
  iconNameFocused: IONavIcons;
  color?: ColorValue;
};

/**
 *  Generic tab icon with badge indicator
 */

export const TabIconComponent = memo(
  ({ focused, iconName, iconNameFocused, color }: TabIconComponent) => (
    // accessibilityLabel={""} in order to read the font icon, without modify the library element
    <View accessibilityLabel={""}>
      <AnimatedIcon
        name={focused ? iconNameFocused : iconName}
        size={24}
        color={color}
      />
    </View>
  )
);
