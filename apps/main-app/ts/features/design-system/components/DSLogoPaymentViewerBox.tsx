import { hexToRgba, IOColors, useIOTheme } from "@io-app/design-system";
/* Fake Transparent BG */
import { ReactNode } from "react";
import { ImageBackground, StyleSheet, Text, View } from "react-native";

import FakeTransparentBg from "../../../../img/utils/transparent-background-pattern.png";

export const logoItemGutter = 8;

const styles = StyleSheet.create({
  logoWrapper: {
    justifyContent: "flex-start",
    paddingHorizontal: logoItemGutter / 2
  },
  logoWrapperMedium: {
    width: "20%"
  },
  logoWrapperLarge: {
    width: "25%"
  },
  logoWrapperFull: {
    width: "100%"
  },
  fakeTransparentBg: {
    position: "absolute",
    width: "275%",
    height: "275%",
    opacity: 0.4
  },
  fakeTransparentBgFull: {
    position: "absolute",
    top: "-25%",
    width: "150%",
    height: "150%",
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
  logoItemFull: {
    aspectRatio: undefined
  },
  iconLabel: {
    fontSize: 10
  }
});

type DSLogoPaymentViewerBoxProps = {
  image: ReactNode;
  name: string;
  size: "full" | "large" | "medium";
};

const sizeMap = {
  medium: {
    wrapper: styles.logoWrapperMedium,
    item: null
  },
  large: {
    wrapper: styles.logoWrapperLarge,
    item: styles.logoItemLarge
  },
  full: {
    wrapper: styles.logoWrapperFull,
    item: styles.logoItemFull
  }
};

export const DSLogoPaymentViewerBox = ({
  name,
  image,
  size
}: DSLogoPaymentViewerBoxProps) => {
  const theme = useIOTheme();

  return (
    <View style={[styles.logoWrapper, sizeMap[size].wrapper]}>
      <View style={[styles.logoItem, sizeMap[size].item]}>
        <ImageBackground
          source={FakeTransparentBg}
          style={
            size === "full"
              ? styles.fakeTransparentBgFull
              : styles.fakeTransparentBg
          }
        />
        {image}
      </View>
      <View style={styles.nameWrapper}>
        {name && (
          <Text
            ellipsizeMode="tail"
            numberOfLines={1}
            style={[
              styles.iconLabel,
              { color: IOColors[theme["textBody-tertiary"]] }
            ]}
          >
            {name}
          </Text>
        )}
      </View>
    </View>
  );
};
