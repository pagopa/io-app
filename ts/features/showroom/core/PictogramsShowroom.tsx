import * as React from "react";
import { View, StyleSheet, SafeAreaView, ScrollView } from "react-native";
import { AssetViewerBox, assetItemGutter } from "../components/AssetViewerBox";
import { H2 } from "../../../components/core/typography/H2";
import {
  Pictogram,
  IOPictograms,
  IOPictogramType,
  PictogramSection,
  IOSectionPictograms,
  IOSectionPictogramType
} from "../../../components/core/pictograms";
import BaseScreenComponent from "../../../components/screens/BaseScreenComponent";
import { IOStyles } from "../../../components/core/variables/IOStyles";

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

export const PictogramsShowroom = () => (
  <BaseScreenComponent goBack={true} headerTitle={"Pictograms"}>
    <SafeAreaView style={IOStyles.flex}>
      <ScrollView>
        <View style={IOStyles.horizontalContentPadding}>
          <H2
            color={"bluegrey"}
            weight={"SemiBold"}
            style={{ marginBottom: 16 }}
          >
            Pictograms
          </H2>
          <View style={styles.itemsWrapper}>
            {Object.entries(IOPictograms).map(([pictogramItemName]) => (
              <AssetViewerBox
                key={pictogramItemName}
                name={pictogramItemName}
                image={
                  <Pictogram
                    name={pictogramItemName as IOPictogramType}
                    size="100%"
                  />
                }
              />
            ))}
          </View>

          <H2
            color={"bluegrey"}
            weight={"SemiBold"}
            style={{ marginBottom: 16 }}
          >
            Sections
          </H2>
          <View style={styles.itemsWrapper}>
            {Object.entries(IOSectionPictograms).map(([pictogramItemName]) => (
              <AssetViewerBox
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
        </View>
      </ScrollView>
    </SafeAreaView>
  </BaseScreenComponent>
);
