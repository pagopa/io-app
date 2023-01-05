import * as React from "react";
import { View, StyleSheet } from "react-native";
import { H2 } from "../../../components/core/typography/H2";
import {
  DSAssetViewerBox,
  assetItemGutter,
  renderRasterImage
} from "../components/DSAssetViewerBox";

/* ILLUSTRATIONS */
/* Onboarding */
import Landing05 from "../../../../img/landing/05.png";
import Landing01 from "../../../../img/landing/01.png";
import Landing02 from "../../../../img/landing/02.png";
import Landing03 from "../../../../img/landing/03.png";
import Landing04 from "../../../../img/landing/04.png";
/* CIE */
import LandingCIE from "../../../../img/cie/CIE-onboarding-illustration.png";
import PlacingCard from "../../../../img/cie/place-card-illustration.png";
import { DesignSystemScreen } from "../components/DesignSystemScreen";

const styles = StyleSheet.create({
  itemsWrapper: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "flex-start",
    marginLeft: (assetItemGutter / 2) * -1,
    marginRight: (assetItemGutter / 2) * -1,
    marginBottom: 16
  }
});

export const DSLegacyIllustrations = () => (
  <DesignSystemScreen title={"Legacy Illustrations"}>
    <H2 color={"bluegrey"} weight={"SemiBold"} style={{ marginBottom: 16 }}>
      Onboarding
    </H2>
    <View style={styles.itemsWrapper}>
      <DSAssetViewerBox
        type="raster"
        name={"05"}
        image={renderRasterImage(Landing05)}
      />
      <DSAssetViewerBox
        type="raster"
        name={"01"}
        image={renderRasterImage(Landing01)}
      />
      <DSAssetViewerBox
        type="raster"
        name={"02"}
        image={renderRasterImage(Landing02)}
      />
      <DSAssetViewerBox
        type="raster"
        name={"03"}
        image={renderRasterImage(Landing03)}
      />
      <DSAssetViewerBox
        type="raster"
        name={"04"}
        image={renderRasterImage(Landing04)}
      />
    </View>
    <H2 color={"bluegrey"} weight={"SemiBold"} style={{ marginBottom: 16 }}>
      CIE
    </H2>
    <View style={styles.itemsWrapper}>
      <DSAssetViewerBox
        type="raster"
        name={"CIE"}
        image={renderRasterImage(LandingCIE)}
      />
      <DSAssetViewerBox
        type="raster"
        name={"Placing Card"}
        image={renderRasterImage(PlacingCard)}
      />
    </View>
  </DesignSystemScreen>
);
