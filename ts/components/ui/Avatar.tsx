// A component to provide organization logo
import * as React from "react";
import { StyleSheet, View } from "react-native";
import { IOVisualCostants } from "../core/variables/IOStyles";
import { IOColors, hexToRgba } from "../core/variables/IOColors";
import { MultiImage } from "./MultiImage";

type Avatar = {
  logoUri: React.ComponentProps<typeof MultiImage>["source"];
};

const avatarBorderLightMode = hexToRgba(IOColors.black, 0.1);
const internalSpace: number = 6;

const styles = StyleSheet.create({
  avatarWrapper: {
    overflow: "hidden",
    padding: internalSpace,
    resizeMode: "contain",
    borderColor: avatarBorderLightMode,
    borderWidth: 1,
    backgroundColor: IOColors.white,
    height: IOVisualCostants.avatarSizeDefault,
    width: IOVisualCostants.avatarSizeDefault,
    // Circle shape
    borderRadius: IOVisualCostants.avatarSizeDefault / 2
  },
  avatarImage: {
    height: "100%",
    width: "100%"
  }
});

const Avatar = ({ logoUri }: Avatar) => (
  <View style={styles.avatarWrapper}>
    <MultiImage style={styles.avatarImage} source={logoUri} />
  </View>
);

export default Avatar;
