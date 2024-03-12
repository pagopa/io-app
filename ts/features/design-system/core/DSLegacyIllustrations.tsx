import * as React from "react";
import { View, StyleSheet } from "react-native";
import { H2 } from "../../../components/core/typography/H2";
import {
  DSAssetViewerBox,
  assetItemGutter,
  renderRasterImage
} from "../components/DSAssetViewerBox";

/* ILLUSTRATIONS */
/* CIE */
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
      CIE
    </H2>
    <View style={styles.itemsWrapper}>
      <DSAssetViewerBox
        type="raster"
        name={"Placing Card"}
        image={renderRasterImage(PlacingCard)}
      />
    </View>
  </DesignSystemScreen>
);
