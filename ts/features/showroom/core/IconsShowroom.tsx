import * as React from "react";
import { View, StyleSheet } from "react-native";
import { IconViewerBox, iconItemGutter } from "../components/IconViewerBox";
import {
  Icon,
  IOIcons,
  IOIconType,
  IconNav,
  IONavIcons,
  IONavIconType,
  IconBiometric,
  IOBiometricIcons,
  IOBiometricIconType,
  IconCategory,
  IOCategoryIcons,
  IOCategoryIconType,
  IconProduct,
  IOProductIcons,
  IOProductIconType
} from "../../../components/core/icons";
import { H2 } from "../../../components/core/typography/H2";
import { H3 } from "../../../components/core/typography/H3";
import { IOColorType } from "../../../components/core/variables/IOColors";
import { DesignSystemScreen } from "../components/DesignSystemScreen";

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

export const IconsShowroom = () => (
  <DesignSystemScreen title={"Icons"}>
    <View style={styles.itemsWrapper}>
      {Object.entries(IOIcons).map(([iconItemName]) => (
        <IconViewerBox
          key={iconItemName}
          name={iconItemName}
          size="small"
          image={<Icon name={iconItemName as IOIconType} size="100%" />}
        />
      ))}
    </View>
    <H2 color={"bluegrey"} weight={"SemiBold"} style={{ marginBottom: 12 }}>
      Navigation
    </H2>
    <View style={styles.itemsWrapper}>
      {Object.entries(IONavIcons).map(([iconItemName]) => (
        <IconViewerBox
          key={iconItemName}
          name={iconItemName}
          size="medium"
          image={<IconNav name={iconItemName as IONavIconType} size="100%" />}
        />
      ))}
    </View>
    <H2 color={"bluegrey"} weight={"SemiBold"} style={{ marginBottom: 12 }}>
      Biometric
    </H2>
    <View style={styles.itemsWrapper}>
      {Object.entries(IOBiometricIcons).map(([iconItemName]) => (
        <IconViewerBox
          key={iconItemName}
          name={iconItemName}
          size="large"
          image={
            <IconBiometric
              name={iconItemName as IOBiometricIconType}
              size="100%"
            />
          }
        />
      ))}
    </View>
    <H2 color={"bluegrey"} weight={"SemiBold"} style={{ marginBottom: 12 }}>
      Categories
    </H2>
    <View style={styles.itemsWrapper}>
      {Object.entries(IOCategoryIcons).map(([iconItemName]) => (
        <IconViewerBox
          key={iconItemName}
          name={iconItemName}
          size="medium"
          image={
            <IconCategory
              name={iconItemName as IOCategoryIconType}
              size="100%"
            />
          }
        />
      ))}
    </View>
    <H2 color={"bluegrey"} weight={"SemiBold"} style={{ marginBottom: 12 }}>
      Product
    </H2>
    <View style={styles.itemsWrapper}>
      {Object.entries(IOProductIcons).map(([iconItemName]) => (
        <IconViewerBox
          key={iconItemName}
          name={iconItemName}
          size="large"
          image={
            <IconProduct name={iconItemName as IOProductIconType} size="100%" />
          }
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
        <IconViewerBox
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
        <IconViewerBox
          key={`iconColor-${color}`}
          name={`${color}`}
          size="medium"
          image={
            <Icon name="messageLegal" size={24} color={color as IOColorType} />
          }
        />
      ))}
    </View>
  </DesignSystemScreen>
);
