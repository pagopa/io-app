/* eslint-disable arrow-body-style */
import * as React from "react";

import { StyleSheet, View } from "react-native";
import DESIGN_SYSTEM_ROUTES from "../navigation/routes";

import { VSpacer } from "../../../components/core/spacer/Spacer";
import { H2 } from "../../../components/core/typography/H2";
import { IOColors } from "../../../components/core/variables/IOColors";
import { TabItem } from "../../../components/ui/TabItem";
import { DSComponentViewerBox } from "../components/DSComponentViewerBox";
import { DesignSystemScreen } from "../components/DesignSystemScreen";

export const DSTabNavigation = () => {
  const handlePress = () => {
    alert("Pressed");
  };

  return (
    <DesignSystemScreen
      title={DESIGN_SYSTEM_ROUTES.COMPONENTS.TAB_NAVIGATION.title}
    >
      <H2>Tab Item</H2>
      <VSpacer size={24} />

      <View style={styles.default}>
        <DSComponentViewerBox name="Default">
          <TabItem
            label="Label tab"
            accessibilityLabel="Label tab"
            onPress={handlePress}
          />
          <VSpacer size={8} />
          <TabItem
            label="Label tab"
            accessibilityLabel="Label tab"
            icon={"starEmpty"}
            iconSelected={"starFilled"}
            onPress={handlePress}
          />
        </DSComponentViewerBox>

        <DSComponentViewerBox name="Selected" last={true}>
          <TabItem
            label="Label tab"
            accessibilityLabel="Label tab"
            selected={true}
            onPress={handlePress}
          />
          <VSpacer size={8} />
          <TabItem
            label="Label tab"
            accessibilityLabel="Label tab"
            icon={"starEmpty"}
            iconSelected={"starFilled"}
            selected={true}
            onPress={handlePress}
          />
        </DSComponentViewerBox>
      </View>

      <VSpacer size={24} />

      <View style={styles.dark}>
        <DSComponentViewerBox name="Dark" colorMode="dark">
          <TabItem
            label="Label tab"
            accessibilityLabel="Label tab"
            color="dark"
            onPress={handlePress}
          />
          <VSpacer size={8} />
          <TabItem
            label="Label tab"
            accessibilityLabel="Label tab"
            icon={"starEmpty"}
            iconSelected={"starFilled"}
            color="dark"
            onPress={handlePress}
          />
        </DSComponentViewerBox>

        <DSComponentViewerBox name="Dark Selected" colorMode="dark" last={true}>
          <TabItem
            label="Label tab"
            accessibilityLabel="Label tab"
            color="dark"
            selected={true}
            onPress={handlePress}
          />
          <VSpacer size={8} />
          <TabItem
            label="Label tab"
            accessibilityLabel="Label tab"
            icon={"starEmpty"}
            iconSelected={"starFilled"}
            color="dark"
            selected={true}
            onPress={handlePress}
          />
        </DSComponentViewerBox>
      </View>
    </DesignSystemScreen>
  );
};

const styles = StyleSheet.create({
  default: {
    backgroundColor: IOColors["blueIO-100"],
    padding: 16,
    borderRadius: 8
  },
  dark: {
    backgroundColor: IOColors["blueIO-850"],
    padding: 16,
    borderRadius: 16
  }
});
