import * as React from "react";
import {
  Text,
  View,
  StyleSheet,
  Image as NativeImage,
  ImageSourcePropType,
  ImageBackground
} from "react-native";
import {
  IOColors,
  hexToRgba
} from "../../../components/core/variables/IOColors";
import { H5 } from "../../../components/core/typography/H5";

/* Fake Transparent BG */
import FakeTransparentBg from "../../../../img/utils/transparent-background-pattern.png";

export const assetItemGutter = 16;

const styles = StyleSheet.create({
  assetWrapper: {
    width: "50%",
    justifyContent: "flex-start",
    marginBottom: 16,
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
  assetItem: {
    overflow: "hidden",
    position: "relative",
    aspectRatio: 1,
    borderRadius: 8,
    padding: 32,
    alignItems: "center",
    justifyContent: "center",
    borderColor: hexToRgba(IOColors.black, 0.1),
    borderWidth: 1
  },
  assetItemBleed: {
    paddingRight: 0,
    paddingLeft: 8,
    paddingVertical: 4,
    justifyContent: "flex-end"
  },
  assetItemSmall: {
    padding: 24
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
    backgroundColor: IOColors.yellow,
    color: IOColors.black
  },
  pillBleed: {
    backgroundColor: IOColors["success-500"],
    color: IOColors.white
  }
});

type DSAssetViewerBoxProps = {
  name: string;
  image: React.ReactNode;
  /* "bleed" shows the pictogram without padding
  "hasBleed" shows the pictgram label on top right */
  type?: "vector" | "raster" | "bleed" | "hasBleed";
  size?: "small" | "medium";
  colorMode?: "light" | "dark";
};

export const renderRasterImage = (image: ImageSourcePropType) => (
  <NativeImage
    source={image}
    resizeMode={"contain"}
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
  colorMode = "light"
}: DSAssetViewerBoxProps) => (
  <View
    style={[
      styles.assetWrapper,
      size === "small" ? styles.assetWrapperSmall : {}
    ]}
  >
    <View
      style={[
        styles.assetItem,
        size === "small" ? styles.assetItemSmall : {},
        type === "bleed" ? styles.assetItemBleed : {},
        colorMode === "dark" ? styles.assetItemDark : {}
      ]}
    >
      <ImageBackground
        style={styles.fakeTransparentBg}
        source={FakeTransparentBg}
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
        <H5
          color={"bluegrey"}
          style={{ alignSelf: "flex-start" }}
          weight={"Regular"}
        >
          {name}
        </H5>
      )}
    </View>
  </View>
);
