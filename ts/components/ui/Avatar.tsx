// A component to provide organization logo
import * as React from "react";
import { StyleSheet, View } from "react-native";
import { IOVisualCostants } from "../core/variables/IOStyles";
import { IOColors, hexToRgba } from "../core/variables/IOColors";
import { MultiImage } from "./MultiImage";

type Avatar = {
  shape: "circle" | "square";
  size: "small" | "medium";
  logoUri: React.ComponentProps<typeof MultiImage>["source"];
};

const avatarBorderLightMode = hexToRgba(IOColors.black, 0.1);
const internalSpaceDefaultSize: number = 6;
const internalSpaceLargeSize: number = 9;
const radiusDefaultSize: number = 8;

const dimensionsMap = {
  small: {
    size: IOVisualCostants.avatarSizeSmall,
    internalSpace: internalSpaceDefaultSize,
    radius: radiusDefaultSize
  },
  medium: {
    size: IOVisualCostants.avatarSizeMedium,
    internalSpace: internalSpaceLargeSize,
    radius: radiusDefaultSize
  }
};

const getAvatarCircleShape = (size: Avatar["size"]) =>
  dimensionsMap[size].size / 2;

const styles = StyleSheet.create({
  avatarWrapper: {
    overflow: "hidden",
    resizeMode: "contain",
    borderColor: avatarBorderLightMode,
    borderWidth: 1,
    backgroundColor: IOColors.white
  },
  avatarImage: {
    height: "100%",
    width: "100%"
  }
});

const Avatar = ({ logoUri, shape, size }: Avatar) => (
  <View
    style={[
      styles.avatarWrapper,
      {
        height: dimensionsMap[size].size,
        width: dimensionsMap[size].size,
        borderRadius:
          shape === "circle"
            ? getAvatarCircleShape(size)
            : dimensionsMap[size].radius,
        padding: dimensionsMap[size].internalSpace
      }
    ]}
  >
    <MultiImage style={styles.avatarImage} source={logoUri} />
  </View>
);

export default Avatar;
