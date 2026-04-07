import {
  H4,
  hexToRgba,
  HSpacer,
  IOColors,
  IOPictograms,
  IOPictogramsBleed,
  IOPictogramsObject,
  Pictogram,
  PictogramBleed,
  SVGPictogramProps,
  useIOTheme,
  VStack
} from "@pagopa/io-app-design-system";
import { JSX } from "react";
import { StyleSheet, View } from "react-native";

import { DesignSystemScreen } from "../components/DesignSystemScreen";
import {
  assetItemGutter,
  DSAssetViewerBox
} from "../components/DSAssetViewerBox";
import { DSComponentViewerBox } from "../components/DSComponentViewerBox";

const styles = StyleSheet.create({
  itemsWrapper: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "flex-start",
    marginLeft: (assetItemGutter / 2) * -1,
    marginRight: (assetItemGutter / 2) * -1,
    rowGap: 16
  },
  agnosticPictogramWrapper: {
    borderRadius: 24,
    borderCurve: "continuous",
    padding: 16,
    alignContent: "center",
    justifyContent: "center",
    flexDirection: "row"
  },
  agnosticPictogramWrapperBlue: {
    backgroundColor: IOColors["blueIO-500"]
  },
  agnosticPictogramWrapperWhite: {
    backgroundColor: IOColors.white,
    borderColor: hexToRgba(IOColors.black, 0.1),
    borderWidth: 1
  }
});

type PictogramSetObject = Record<
  string,
  ({ size }: SVGPictogramProps) => JSX.Element
>;
// Filter the main object, removing already displayed pictograms in the other sets
type PictogramSubsetObject = Record<
  string,
  ({ size }: SVGPictogramProps) => JSX.Element
>;

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
  IOPictogramsObject,
  IOPictograms
);

const sectionMargin = 40;
const sectionTitleMargin = 16;

export const DSPictograms = () => {
  const theme = useIOTheme();
  return (
    <DesignSystemScreen title={"Pictograms"}>
      <VStack space={sectionMargin}>
        {/* General Pictogram set */}
        <View style={styles.itemsWrapper}>
          {Object.entries(filteredIOPictograms).map(([pictogramItemName]) => (
            <DSAssetViewerBox
              image={
                <Pictogram
                  name={pictogramItemName as IOPictograms}
                  size="100%"
                />
              }
              key={pictogramItemName}
              name={pictogramItemName}
              spacing="small"
              type={
                Object.keys(IOPictogramsBleed).includes(pictogramItemName)
                  ? "hasBleed"
                  : "vector"
              }
            />
          ))}
        </View>

        {/* Bleed */}
        <VStack space={sectionTitleMargin}>
          <H4 color={theme["textHeading-default"]}>Bleed</H4>
          <View style={styles.itemsWrapper}>
            {Object.entries(IOPictogramsBleed).map(([pictogramItemName]) => (
              <DSAssetViewerBox
                image={
                  <PictogramBleed
                    name={pictogramItemName as IOPictogramsBleed}
                    size="100%"
                  />
                }
                key={pictogramItemName}
                name={pictogramItemName}
                size="small"
                type="bleed"
              />
            ))}
          </View>
        </VStack>

        {/* Objects */}
        <VStack space={sectionTitleMargin}>
          <H4 color={theme["textHeading-default"]}>Objects</H4>
          <View style={styles.itemsWrapper}>
            {Object.entries(IOPictogramsObject).map(([pictogramItemName]) => (
              <DSAssetViewerBox
                image={
                  <Pictogram
                    name={pictogramItemName as IOPictogramsObject}
                    size="100%"
                  />
                }
                key={pictogramItemName}
                name={pictogramItemName}
                size="small"
                spacing="small"
              />
            ))}
          </View>
        </VStack>

        {/* Color mode agnostic */}
        <VStack space={sectionTitleMargin}>
          <H4 color={theme["textHeading-default"]}>Color mode agnostic</H4>
          <VStack space={24}>
            <DSComponentViewerBox name={`pictogramStyle = "light-content"`}>
              <View
                style={[
                  styles.agnosticPictogramWrapper,
                  styles.agnosticPictogramWrapperBlue
                ]}
              >
                <Pictogram name="feature" pictogramStyle="light-content" />
                <HSpacer size={24} />
                <Pictogram name="umbrella" pictogramStyle="light-content" />
              </View>
            </DSComponentViewerBox>

            <DSComponentViewerBox name={`pictogramStyle = "dark-content"`}>
              <View
                style={[
                  styles.agnosticPictogramWrapper,
                  styles.agnosticPictogramWrapperWhite
                ]}
              >
                <Pictogram name="feedback" pictogramStyle="dark-content" />
                <HSpacer size={24} />
                <Pictogram name="charity" pictogramStyle="dark-content" />
              </View>
            </DSComponentViewerBox>
          </VStack>
        </VStack>
      </VStack>
    </DesignSystemScreen>
  );
};
