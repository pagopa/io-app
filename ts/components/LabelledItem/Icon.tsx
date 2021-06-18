import * as React from "react";
import { ImageSourcePropType, ImageStyle, Image } from "react-native";
import { isString } from "lodash";
import { IconProps } from "react-native-vector-icons/Icon";
import IconFont from "../ui/IconFont";
import variables from "../../theme/variables";

// Style type must be generalized so as to support both text icons and image icons
type StyleType = IconProps["style"] & ImageStyle;

type Props = {
  icon?: string | ImageSourcePropType;
  iconColor?: string;
  iconStyle?: StyleType;
  accessibilityLabelIcon?: string;
  onPress?: () => void;
};

export const Icon: React.FC<Props> = ({
  icon,
  iconColor,
  iconStyle,
  onPress,
  accessibilityLabelIcon
}): React.ReactElement => (
  <>
    {icon &&
      (isString(icon) ? (
        <IconFont
          size={variables.iconSize3}
          color={iconColor ? iconColor : variables.brandDarkGray}
          name={icon}
          style={iconStyle}
          onPress={onPress}
          accessibilityLabel={accessibilityLabelIcon}
        />
      ) : (
        <Image source={icon} style={iconStyle} />
      ))}
  </>
);
