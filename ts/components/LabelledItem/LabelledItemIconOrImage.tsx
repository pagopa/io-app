import { IOColors, IOIcons, Icon } from "@pagopa/io-app-design-system";
import { isString } from "lodash";
import {
  Image,
  ImageSourcePropType,
  ImageStyle,
  Pressable
} from "react-native";

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
      <Image
        accessibilityIgnoresInvertColors
        source={icon}
        style={imageStyle}
        testID="LabelledItem_Image"
      />
    )}
  </Pressable>
);
