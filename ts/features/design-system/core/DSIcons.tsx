import * as React from "react";
import { View, StyleSheet } from "react-native";
import { DSIconViewerBox, iconItemGutter } from "../components/DSIconViewerBox";
import {
  Icon,
  IOIcons,
  IONavIcons,
  IOBiometricIcons,
  IOCategoryIcons,
  IOProductIcons,
  IOIconsNew,
  SVGIconProps
} from "../../../components/core/icons";
import { H2 } from "../../../components/core/typography/H2";
import { H3 } from "../../../components/core/typography/H3";
import type { IOColors } from "../../../components/core/variables/IOColors";
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
  { ...IONavIcons, ...IOCategoryIcons, ...IOProductIcons, ...IOBiometricIcons },
  IOIcons
);

// Just for demo purposes
// Once we defined a general set of icon sizes,
// just replace the following array:
const IOIconSizes = [16, 24, 32, 48];
const IOIconColors = ["bluegreyLight", "grey", "bluegrey", "blue", "red"];

const styles = StyleSheet.create({
  itemsWrapper: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "flex-start",
    marginLeft: (iconItemGutter / 2) * -1,
    marginRight: (iconItemGutter / 2) * -1,
    marginBottom: 16
  }
});

export const DSIcons = () => (
  <DesignSystemScreen title={"Icons"}>
    <View style={styles.itemsWrapper}>
      {Object.entries(filteredIOIcons).map(([iconItemName]) => (
        <DSIconViewerBox
          key={iconItemName}
          name={iconItemName}
          size="small"
          image={<Icon name={iconItemName as IOIcons} size="100%" />}
          withDot={Object.keys(IOIconsNew).includes(iconItemName)}
        />
      ))}
    </View>
    <H2 color={"bluegrey"} weight={"SemiBold"} style={{ marginBottom: 12 }}>
      Navigation
    </H2>
    <View style={styles.itemsWrapper}>
      {Object.entries(IONavIcons).map(([iconItemName]) => (
        <DSIconViewerBox
          key={iconItemName}
          name={iconItemName}
          size="medium"
          image={<Icon name={iconItemName as IONavIcons} size="100%" />}
        />
      ))}
    </View>
    <H2 color={"bluegrey"} weight={"SemiBold"} style={{ marginBottom: 12 }}>
      Biometric
    </H2>
    <View style={styles.itemsWrapper}>
      {Object.entries(IOBiometricIcons).map(([iconItemName]) => (
        <DSIconViewerBox
          key={iconItemName}
          name={iconItemName}
          size="large"
          image={<Icon name={iconItemName as IOBiometricIcons} size="100%" />}
        />
      ))}
    </View>
    <H2 color={"bluegrey"} weight={"SemiBold"} style={{ marginBottom: 12 }}>
      Categories
    </H2>
    <View style={styles.itemsWrapper}>
      {Object.entries(IOCategoryIcons).map(([iconItemName]) => (
        <DSIconViewerBox
          key={iconItemName}
          name={iconItemName}
          size="medium"
          image={<Icon name={iconItemName as IOCategoryIcons} size="100%" />}
        />
      ))}
    </View>
    <H2 color={"bluegrey"} weight={"SemiBold"} style={{ marginBottom: 12 }}>
      Product
    </H2>
    <View style={styles.itemsWrapper}>
      {Object.entries(IOProductIcons).map(([iconItemName]) => (
        <DSIconViewerBox
          key={iconItemName}
          name={iconItemName}
          size="large"
          image={<Icon name={iconItemName as IOProductIcons} size="100%" />}
        />
      ))}
    </View>
    <H3 color={"bluegrey"} weight={"SemiBold"} style={{ marginBottom: 12 }}>
      Sizes
    </H3>
    <View style={styles.itemsWrapper}>
      {/* If you want to render another icon in different sizes,
      just change the name below */}
      {IOIconSizes.map(size => (
        <DSIconViewerBox
          key={`iconSize-${size}`}
          name={`${size}`}
          image={<Icon name="creditCard" size={size} />}
        />
      ))}
    </View>
    <H3 color={"bluegrey"} weight={"SemiBold"} style={{ marginBottom: 12 }}>
      Colors
    </H3>
    <View style={styles.itemsWrapper}>
      {IOIconColors.map(color => (
        <DSIconViewerBox
          key={`iconColor-${color}`}
          name={`${color}`}
          size="medium"
          image={
            <Icon name="messageLegal" size={24} color={color as IOColors} />
          }
        />
      ))}
    </View>
  </DesignSystemScreen>
);
