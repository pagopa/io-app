import * as React from "react";
import {
  Image,
  ImageSourcePropType,
  ImageStyle,
  StyleSheet
} from "react-native";
import { IOColors, IOIcons, Icon } from "@pagopa/io-app-design-system";
import { isString } from "lodash";
import ButtonDefaultOpacity from "../ButtonDefaultOpacity";

const styles = StyleSheet.create({
  button: {
    paddingTop: 0,
    paddingBottom: 0,
    paddingLeft: 0,
    paddingRight: 0,
    alignSelf: "auto",
    height: "auto"
  }
});

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
  <ButtonDefaultOpacity
    testID="ButtonDefaultOpacity"
    onPress={onPress}
    transparent
    accessible={accessible ?? true}
    style={styles.button}
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
  </ButtonDefaultOpacity>
);
