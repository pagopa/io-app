import { hexToRgba, IOColors, useIOTheme } from "@io-app/design-system";
/* Fake Transparent BG */
import { ReactNode } from "react";
import {
  ImageBackground,
  ImageSourcePropType,
  Image as NativeImage,
  StyleSheet,
  Text,
  View
} from "react-native";

import FakeTransparentBg from "../../../../img/utils/transparent-background-pattern.png";

export const assetItemGutter = 16;

const styles = StyleSheet.create({
  assetWrapper: {
    width: "50%",
    justifyContent: "flex-start",
    paddingHorizontal: assetItemGutter / 2
  },
  assetWrapperSmall: {
    width: "33%"
  },
  image: {
    width: "100%",
    height: "100%"
  },
  fakeTransparentBg: {
    position: "absolute",
    width: "200%",
    height: "200%",
    opacity: 0.4
  },
  assetLabel: {
    fontSize: 12
  },
  assetItem: {
    overflow: "hidden",
    position: "relative",
    aspectRatio: 1,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    borderColor: hexToRgba(IOColors.black, 0.1),
    borderWidth: 1
  },
  assetItemSpacingSmall: {
    padding: 16
  },
  assetItemSpacingLarge: {
    padding: 32
  },
  assetItemBleed: {
    paddingRight: 0,
    paddingLeft: 8,
    paddingVertical: 4,
    justifyContent: "flex-end"
  },
  assetItemDark: {
    backgroundColor: IOColors.black
  },
  pill: {
    position: "absolute",
    right: 8,
    top: 8,
    overflow: "hidden",
    fontSize: 8,
    textTransform: "uppercase",
    padding: 4,
    borderRadius: 4
  },
  pillSmall: {
    right: 4,
    top: 4
  },
  pillRaster: {
    backgroundColor: IOColors["warning-500"],
    color: IOColors.black
  },
  pillBleed: {
    backgroundColor: IOColors["success-500"],
    color: IOColors.white
  }
});

type DSAssetViewerBoxProps = {
  colorMode?: "dark" | "light";
  image: ReactNode;
  name: string;
  size?: "medium" | "small";
  spacing?: "large" | "small";
  /* "bleed" shows the pictogram without padding
  "hasBleed" shows the pictgram label on top right */
  type?: "bleed" | "hasBleed" | "raster" | "vector";
};

export const renderRasterImage = (image: ImageSourcePropType) => (
  <NativeImage
    resizeMode={"contain"}
    source={image}
    style={styles.image}
    testID={"rasterImage"}
  />
);

const pillMap = {
  raster: {
    style: styles.pillRaster,
    text: "Png"
  },
  hasBleed: {
    style: styles.pillBleed,
    text: "Bleed"
  }
};

export const DSAssetViewerBox = ({
  name,
  image,
  type = "vector",
  size = "medium",
  spacing = "large",
  colorMode = "light"
}: DSAssetViewerBoxProps) => {
  const theme = useIOTheme();

  return (
    <View
      style={[
        styles.assetWrapper,
        size === "small" ? styles.assetWrapperSmall : {}
      ]}
    >
      <View
        style={[
          styles.assetItem,
          type === "bleed" ? styles.assetItemBleed : {},
          spacing === "large"
            ? styles.assetItemSpacingLarge
            : styles.assetItemSpacingSmall,
          colorMode === "dark" ? styles.assetItemDark : {}
        ]}
      >
        <ImageBackground
          source={FakeTransparentBg}
          style={styles.fakeTransparentBg}
        />
        {image}
        {type === "raster" ||
          (type === "hasBleed" && (
            <Text
              style={[
                styles.pill,
                size === "small" ? styles.pillSmall : {},
                pillMap[type].style
              ]}
            >
              {pillMap[type].text}
            </Text>
          ))}
      </View>
      <View
        style={{
          display: "flex",
          flexDirection: "row",
          justifyContent: "space-between",
          marginTop: 4
        }}
      >
        {name && (
          <Text
            ellipsizeMode="tail"
            numberOfLines={1}
            style={[
              styles.assetLabel,
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
