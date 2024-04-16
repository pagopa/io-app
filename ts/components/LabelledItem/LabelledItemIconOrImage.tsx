import * as React from "react";
import {
  Image,
  ImageSourcePropType,
  ImageStyle,
  Pressable
} from "react-native";
import { IOColors, IOIcons, Icon } from "@pagopa/io-app-design-system";
import { isString } from "lodash";

type LabelledItemIconOrImageProps = {
  icon: IOIcons | ImageSourcePropType;
  iconColor?: IOColors;
  imageStyle?: ImageStyle;
  accessible?: boolean;
  accessibilityLabelIcon?: string;
  onPress?: () => void;
};

export const LabelledItemIconOrImage = ({
  icon,
  iconColor,
  imageStyle,
  accessible,
  onPress,
  accessibilityLabelIcon
}: LabelledItemIconOrImageProps) => (
  <Pressable
    testID="ButtonDefaultOpacity"
    onPress={onPress}
    accessible={accessible ?? true}
    style={{
      alignSelf: "center"
    }}
  >
    {isString(icon) ? (
      <Icon
        size={24}
        color={iconColor}
        name={icon}
        accessibilityLabel={accessibilityLabelIcon}
        testID="LabelledItem_Icon"
      />
    ) : (
      <Image source={icon} style={imageStyle} testID="LabelledItem_Image" />
    )}
  </Pressable>
);
