import {
  H4,
  HStack,
  IOBiometricIcons,
  IOCategoryIcons,
  IOIconSizeScale,
  IOIcons,
  IOIconsNew,
  IONavIcons,
  IOProductIcons,
  IOSystemIcons,
  Icon,
  IconContained,
  SVGIconProps,
  VStack,
  useIOTheme
} from "@pagopa/io-app-design-system";
import { StyleSheet, View } from "react-native";
import { JSX } from "react";
import { DSComponentViewerBox } from "../components/DSComponentViewerBox";
import { DSIconViewerBox, iconItemGutter } from "../components/DSIconViewerBox";
import { DesignSystemScreen } from "../components/DesignSystemScreen";

// Filter the main object, removing already displayed icons in the other sets
type IconSubsetObject = Record<
  string,
  ({ size, style }: SVGIconProps) => JSX.Element
>;
interface IconSetObject {
  [key: string]: ({ size, style }: SVGIconProps) => JSX.Element;
}
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
  }
});

const sectionMargin = 40;
const sectionTitleMargin = 16;

export const DSIcons = () => {
  const theme = useIOTheme();

  return (
    <DesignSystemScreen title={"Icons"}>
      <VStack space={sectionMargin}>
        {/* General Set */}
        <View style={styles.itemsWrapper}>
          {Object.entries(filteredIOIcons).map(([iconItemName]) => (
            <DSIconViewerBox
              key={iconItemName}
              name={iconItemName}
              size="small"
              image={
                <Icon
                  name={iconItemName as IOIcons}
                  color={theme["icon-default"]}
                  size="100%"
                />
              }
              withDot={Object.keys(IOIconsNew).includes(iconItemName)}
            />
          ))}
        </View>

        {/* Navigation */}
        <VStack space={sectionTitleMargin}>
          <H4 color={theme["textHeading-default"]}>Navigation</H4>
          <View style={styles.itemsWrapper}>
            {Object.entries(IONavIcons).map(([iconItemName]) => (
              <DSIconViewerBox
                key={iconItemName}
                name={iconItemName}
                size="medium"
                image={
                  <Icon
                    name={iconItemName as IONavIcons}
                    color={theme["icon-default"]}
                    size="100%"
                  />
                }
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
                key={iconItemName}
                name={iconItemName}
                size="medium"
                image={
                  <Icon
                    name={iconItemName as IOBiometricIcons}
                    color={theme["icon-default"]}
                    size="100%"
                  />
                }
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
                key={iconItemName}
                name={iconItemName}
                size="medium"
                image={
                  <Icon
                    name={iconItemName as IOCategoryIcons}
                    color={theme["icon-default"]}
                    size="100%"
                  />
                }
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
                key={iconItemName}
                name={iconItemName}
                size="medium"
                image={
                  <Icon
                    name={iconItemName as IOProductIcons}
                    color={theme["icon-default"]}
                    size="100%"
                  />
                }
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
                key={iconItemName}
                name={iconItemName}
                size="medium"
                image={
                  <Icon
                    name={iconItemName as IOSystemIcons}
                    color={theme["icon-default"]}
                    size="100%"
                  />
                }
              />
            ))}
          </View>
        </VStack>

        {/* IconContained */}
        <VStack space={sectionTitleMargin}>
          <H4 color={theme["textHeading-default"]}>IconContained</H4>
          <DSComponentViewerBox name="IconContained · Tonal variant, neutral color">
            <HStack space={8}>
              <IconContained icon="device" variant="tonal" color="neutral" />
              <IconContained
                icon="institution"
                variant="tonal"
                color="neutral"
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
                key={`iconSize-${size}`}
                name={`${size}`}
                image={
                  <Icon
                    name="creditCard"
                    color={theme["icon-default"]}
                    size={size}
                  />
                }
              />
            ))}
          </View>
        </VStack>
      </VStack>
    </DesignSystemScreen>
  );
};
