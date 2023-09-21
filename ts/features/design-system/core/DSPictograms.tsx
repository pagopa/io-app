import * as React from "react";
import { View, StyleSheet } from "react-native";
import {
  IOPictograms,
  IOPictogramsBleed,
  IOPictogramsObject,
  IOPictogramsLegacy,
  IOThemeContext,
  Pictogram,
  PictogramBleed,
  SVGPictogramProps
} from "@pagopa/io-app-design-system";
import { useContext } from "react";
import {
  DSAssetViewerBox,
  assetItemGutter
} from "../components/DSAssetViewerBox";
import { H2 } from "../../../components/core/typography/H2";
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

// Filter the main object, removing already displayed pictograms in the other sets
type PictogramSubsetObject = Record<
  string,
  ({ size }: SVGPictogramProps) => JSX.Element
>;
interface PictogramSetObject {
  [key: string]: ({ size }: SVGPictogramProps) => JSX.Element;
}

const filterPictogramSet = (
  pictogramSubsetObject: PictogramSubsetObject,
  pictogramSetObject: PictogramSetObject
): PictogramSetObject =>
  Object.fromEntries(
    Object.entries(pictogramSetObject).filter(
      ([key]) => !Object.keys(pictogramSubsetObject).includes(key)
    )
  );

const filteredIOPictograms = filterPictogramSet(
  {
    ...IOPictogramsObject,
    ...IOPictogramsLegacy
  },
  IOPictograms
);

export const DSPictograms = () => {
  const theme = useContext(IOThemeContext);
  return (
    <DesignSystemScreen title={"Pictograms"}>
      <H2
        color={theme["textHeading-default"]}
        weight={"SemiBold"}
        style={{
          marginBottom: 16
        }}
      >
        Pictograms
      </H2>
      <View style={styles.itemsWrapper}>
        {Object.entries(filteredIOPictograms).map(([pictogramItemName]) => (
          <DSAssetViewerBox
            key={pictogramItemName}
            name={pictogramItemName}
            spacing="small"
            type={
              Object.keys(IOPictogramsBleed).includes(pictogramItemName)
                ? "hasBleed"
                : "vector"
            }
            image={
              <Pictogram name={pictogramItemName as IOPictograms} size="100%" />
            }
          />
        ))}
      </View>

      <H2
        color={theme["textHeading-default"]}
        weight={"SemiBold"}
        style={{
          marginBottom: 16
        }}
      >
        Object Pictograms
      </H2>
      <View style={styles.itemsWrapper}>
        {Object.entries(IOPictogramsObject).map(([pictogramItemName]) => (
          <DSAssetViewerBox
            key={pictogramItemName}
            name={pictogramItemName}
            spacing="small"
            size="small"
            image={
              <Pictogram
                name={pictogramItemName as IOPictogramsObject}
                size="100%"
              />
            }
          />
        ))}
      </View>

      <H2
        color={theme["textHeading-default"]}
        weight={"SemiBold"}
        style={{
          marginBottom: 16
        }}
      >
        Bleed Pictograms
      </H2>
      <View style={styles.itemsWrapper}>
        {Object.entries(IOPictogramsBleed).map(([pictogramItemName]) => (
          <DSAssetViewerBox
            type="bleed"
            key={pictogramItemName}
            name={pictogramItemName}
            size="small"
            image={
              <PictogramBleed
                name={pictogramItemName as IOPictogramsBleed}
                size="100%"
              />
            }
          />
        ))}
      </View>

      <H2
        color={theme["textHeading-default"]}
        weight={"SemiBold"}
        style={{
          marginBottom: 16
        }}
      >
        Legacy Pictograms
      </H2>
      <View style={styles.itemsWrapper}>
        {Object.entries(IOPictogramsLegacy).map(([pictogramItemName]) => (
          <DSAssetViewerBox
            key={pictogramItemName}
            name={pictogramItemName}
            image={
              <Pictogram name={pictogramItemName as IOPictograms} size="100%" />
            }
          />
        ))}
      </View>
    </DesignSystemScreen>
  );
};
