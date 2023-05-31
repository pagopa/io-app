// A component to provide organization logo
import * as React from "react";
import { StyleSheet, Image } from "react-native";
import { IOVisualCostants } from "../core/variables/IOStyles";
import { IOColors, hexToRgba } from "../core/variables/IOColors";
// import { MultiImage } from "./MultiImage";

type Avatar = {
  logoUri: React.ComponentProps<typeof Image>["source"];
};

const avatarBorderLightMode = hexToRgba(IOColors.black, 0.1);

const styles = StyleSheet.create({
  avatarImage: {
    padding: 6,
    resizeMode: "contain",
    borderColor: avatarBorderLightMode,
    borderWidth: 1,
    backgroundColor: IOColors.white,
    height: IOVisualCostants.avatarSizeDefault,
    width: IOVisualCostants.avatarSizeDefault,
    // Circle shape
    borderRadius: IOVisualCostants.avatarSizeDefault / 2
  }
});

const Avatar = ({ logoUri }: Avatar) => (
  <Image style={styles.avatarImage} source={logoUri} />
);

export default Avatar;
