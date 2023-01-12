import * as React from "react";
import { View, StyleSheet, Text, ImageBackground } from "react-native";
import {
  IOColors,
  hexToRgba
} from "../../../components/core/variables/IOColors";

/* Fake Transparent BG */
import FakeTransparentBg from "../../../../img/utils/transparent-background-pattern.png";

export const logoItemGutter = 8;

const styles = StyleSheet.create({
  logoWrapper: {
    justifyContent: "flex-start",
    marginBottom: 16,
    paddingHorizontal: logoItemGutter / 2
  },
  logoWrapperMedium: {
    width: "20%"
  },
  logoWrapperLarge: {
    width: "25%"
  },
  fakeTransparentBg: {
    position: "absolute",
    width: "275%",
    height: "275%",
    opacity: 0.4
  },
  nameWrapper: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 4
  },
  logoItem: {
    overflow: "hidden",
    position: "relative",
    borderRadius: 8,
    aspectRatio: 1,
    padding: 16,
    alignItems: "center",
    justifyContent: "center",
    borderColor: hexToRgba(IOColors.black, 0.1),
    borderWidth: 1
  },
  logoItemLarge: {
    aspectRatio: 4 / 3
  },
  iconLabel: {
    fontSize: 10,
    color: IOColors.bluegrey
  }
});

type DSLogoPaymentViewerBoxProps = {
  name: string;
  image: React.ReactNode;
  size: "medium" | "large";
};

const sizeMap = {
  medium: {
    wrapper: styles.logoWrapperMedium,
    item: null
  },
  large: {
    wrapper: styles.logoWrapperLarge,
    item: styles.logoItemLarge
  }
};

export const DSLogoPaymentViewerBox = ({
  name,
  image,
  size
}: DSLogoPaymentViewerBoxProps) => (
  <View style={[styles.logoWrapper, sizeMap[size].wrapper]}>
    <View style={[styles.logoItem, sizeMap[size].item]}>
      <ImageBackground
        style={styles.fakeTransparentBg}
        source={FakeTransparentBg}
      />
      {image}
    </View>
    <View style={styles.nameWrapper}>
      {name && (
        <Text numberOfLines={1} ellipsizeMode="tail" style={styles.iconLabel}>
          {name}
        </Text>
      )}
    </View>
  </View>
);
