import {
  H4,
  HStack,
  Icon,
  IconContained,
  IOBiometricIcons,
  IOCategoryIcons,
  IOIcons,
  IOIconSizeScale,
  IOIconsNew,
  IONavIcons,
  IOProductIcons,
  IOSystemIcons,
  SVGIconProps,
  useIOTheme,
  VStack
} from "@pagopa/io-app-design-system";
import { JSX, useCallback } from "react";
import { FlatList, ListRenderItemInfo, StyleSheet, View } from "react-native";

import { DesignSystemScreen } from "../components/DesignSystemScreen";
import { DSComponentViewerBox } from "../components/DSComponentViewerBox";
import { DSIconViewerBox, iconItemGutter } from "../components/DSIconViewerBox";

interface IconSetObject {
  [key: string]: ({ size, style }: SVGIconProps) => JSX.Element;
}
// Filter the main object, removing already displayed icons in the other sets
type IconSubsetObject = Record<
  string,
  ({ size, style }: SVGIconProps) => JSX.Element
>;
const filterIconSet = (
  iconSubsetObject: IconSubsetObject,
  iconSetObject: IconSetObject
): IconSetObject =>
  Object.fromEntries(
    Object.entries(iconSetObject).filter(
      ([key]) => !Object.keys(iconSubsetObject).includes(key)
    )
  );

const filteredIOIcons = filterIconSet(
  {
    ...IONavIcons,
    ...IOCategoryIcons,
    ...IOProductIcons,
    ...IOBiometricIcons,
    ...IOSystemIcons
  },
  IOIcons
);

const IOIconsNewKeys = new Set(Object.keys(IOIconsNew));
const iconGridNumColumns = 6;

// Pad with empty strings so the last row is always full,
// preventing flex: 1 from stretching partial rows.
const filteredIOIconKeys = (() => {
  const keys = Object.keys(filteredIOIcons);
  const remainder = keys.length % iconGridNumColumns;
  if (remainder === 0) {
    return keys;
  }
  const placeholders = Array.from<string>({
    length: iconGridNumColumns - remainder
  }).fill("");
  return [...keys, ...placeholders];
})();

// Just for demo purposes
// Once we defined a general set of icon sizes,
// just replace the following array:
const IOIconSizes: Array<IOIconSizeScale> = [16, 24, 32, 48];

const styles = StyleSheet.create({
  itemsWrapper: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "flex-start",
    marginLeft: (iconItemGutter / 2) * -1,
    marginRight: (iconItemGutter / 2) * -1,
    rowGap: 16
  },
  gridColumnWrapper: {
    columnGap: "1%"
  },
  gridContentContainer: {
    rowGap: 16
  },
  gridItem: {
    flex: 1
  }
});

const sectionMargin = 40;
const sectionTitleMargin = 16;

const keyExtractor = (item: string, index: number) =>
  item || `placeholder-${index}`;

export const DSIcons = () => {
  const theme = useIOTheme();
  const iconColor = theme["icon-default"];

  const renderGeneralIconItem = useCallback(
    ({ item }: ListRenderItemInfo<string>) => (
      <View style={styles.gridItem}>
        {item ? (
          <DSIconViewerBox
            fullWidth
            image={
              <Icon color={iconColor} name={item as IOIcons} size="100%" />
            }
            name={item}
            size="small"
            withDot={IOIconsNewKeys.has(item)}
          />
        ) : null}
      </View>
    ),
    [iconColor]
  );

  return (
    <DesignSystemScreen title={"Icons"}>
      <VStack space={sectionMargin}>
        {/* General Set */}
        <FlatList
          columnWrapperStyle={styles.gridColumnWrapper}
          contentContainerStyle={styles.gridContentContainer}
          data={filteredIOIconKeys}
          initialNumToRender={30}
          keyExtractor={keyExtractor}
          maxToRenderPerBatch={30}
          numColumns={iconGridNumColumns}
          renderItem={renderGeneralIconItem}
          scrollEnabled={false}
          windowSize={5}
        />

        {/* Navigation */}
        <VStack space={sectionTitleMargin}>
          <H4 color={theme["textHeading-default"]}>Navigation</H4>
          <View style={styles.itemsWrapper}>
            {Object.entries(IONavIcons).map(([iconItemName]) => (
              <DSIconViewerBox
                image={
                  <Icon
                    color={theme["icon-default"]}
                    name={iconItemName as IONavIcons}
                    size="100%"
                  />
                }
                key={iconItemName}
                name={iconItemName}
                size="medium"
              />
            ))}
          </View>
        </VStack>

        {/* Biometric */}
        <VStack space={sectionTitleMargin}>
          <H4 color={theme["textHeading-default"]}>Biometric</H4>
          <View style={styles.itemsWrapper}>
            {Object.entries(IOBiometricIcons).map(([iconItemName]) => (
              <DSIconViewerBox
                image={
                  <Icon
                    color={theme["icon-default"]}
                    name={iconItemName as IOBiometricIcons}
                    size="100%"
                  />
                }
                key={iconItemName}
                name={iconItemName}
                size="medium"
              />
            ))}
          </View>
        </VStack>

        {/* Categories */}
        <VStack space={sectionTitleMargin}>
          <H4 color={theme["textHeading-default"]}>Categories</H4>
          <View style={styles.itemsWrapper}>
            {Object.entries(IOCategoryIcons).map(([iconItemName]) => (
              <DSIconViewerBox
                image={
                  <Icon
                    color={theme["icon-default"]}
                    name={iconItemName as IOCategoryIcons}
                    size="100%"
                  />
                }
                key={iconItemName}
                name={iconItemName}
                size="medium"
              />
            ))}
          </View>
        </VStack>

        {/* Product */}
        <VStack space={sectionTitleMargin}>
          <H4 color={theme["textHeading-default"]}>Product</H4>
          <View style={styles.itemsWrapper}>
            {Object.entries(IOProductIcons).map(([iconItemName]) => (
              <DSIconViewerBox
                image={
                  <Icon
                    color={theme["icon-default"]}
                    name={iconItemName as IOProductIcons}
                    size="100%"
                  />
                }
                key={iconItemName}
                name={iconItemName}
                size="medium"
              />
            ))}
          </View>
        </VStack>

        {/* System */}
        <VStack space={sectionTitleMargin}>
          <H4 color={theme["textHeading-default"]}>System</H4>
          <View style={styles.itemsWrapper}>
            {Object.entries(IOSystemIcons).map(([iconItemName]) => (
              <DSIconViewerBox
                image={
                  <Icon
                    color={theme["icon-default"]}
                    name={iconItemName as IOSystemIcons}
                    size="100%"
                  />
                }
                key={iconItemName}
                name={iconItemName}
                size="medium"
              />
            ))}
          </View>
        </VStack>

        {/* IconContained */}
        <VStack space={sectionTitleMargin}>
          <H4 color={theme["textHeading-default"]}>IconContained</H4>
          <DSComponentViewerBox name="IconContained · Tonal variant, neutral color">
            <HStack space={8}>
              <IconContained color="neutral" icon="device" variant="tonal" />
              <IconContained
                color="neutral"
                icon="institution"
                variant="tonal"
              />
            </HStack>
          </DSComponentViewerBox>
        </VStack>

        {/* Sizes */}
        <VStack space={sectionTitleMargin}>
          <H4 color={theme["textHeading-default"]}>Sizes</H4>
          <View style={styles.itemsWrapper}>
            {IOIconSizes.map(size => (
              <DSIconViewerBox
                image={
                  <Icon
                    color={theme["icon-default"]}
                    name="creditCard"
                    size={size}
                  />
                }
                key={`iconSize-${size}`}
                name={`${size}`}
              />
            ))}
          </View>
        </VStack>
      </VStack>
    </DesignSystemScreen>
  );
};
