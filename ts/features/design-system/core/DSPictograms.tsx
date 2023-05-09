import * as React from "react";
import { View, StyleSheet } from "react-native";
import {
  DSAssetViewerBox,
  assetItemGutter
} from "../components/DSAssetViewerBox";
import { H2 } from "../../../components/core/typography/H2";
import {
  Pictogram,
  IOPictograms,
  PictogramSection,
  IOSectionPictograms,
  IOSectionPictogramType
} from "../../../components/core/pictograms";
import { DesignSystemScreen } from "../components/DesignSystemScreen";

const styles = StyleSheet.create({
  itemsWrapper: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "flex-start",
    marginLeft: (assetItemGutter / 2) * -1,
    marginRight: (assetItemGutter / 2) * -1,
    marginBottom: 24
  }
});

export const DSPictograms = () => (
  <DesignSystemScreen title={"Pictograms"}>
    <H2 color={"bluegrey"} weight={"SemiBold"} style={{ marginBottom: 16 }}>
      Pictograms
    </H2>
    <View style={styles.itemsWrapper}>
      {Object.entries(IOPictograms).map(([pictogramItemName]) => (
        <DSAssetViewerBox
          key={pictogramItemName}
          name={pictogramItemName}
          image={
            <Pictogram name={pictogramItemName as IOPictograms} size="100%" />
          }
        />
      ))}
    </View>

    <H2 color={"bluegrey"} weight={"SemiBold"} style={{ marginBottom: 16 }}>
      Sections
    </H2>
    <View style={styles.itemsWrapper}>
      {Object.entries(IOSectionPictograms).map(([pictogramItemName]) => (
        <DSAssetViewerBox
          colorMode="dark"
          size="small"
          key={pictogramItemName}
          name={pictogramItemName}
          image={
            <PictogramSection
              name={pictogramItemName as IOSectionPictogramType}
              size="100%"
            />
          }
        />
      ))}
    </View>
  </DesignSystemScreen>
);
