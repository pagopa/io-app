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
import {
  TabNavigation,
  TabNavigationItem
} from "../../../components/ui/TabNavigation";
import { ContentWrapper } from "../../../components/core/ContentWrapper";

export const DSTabNavigation = () => {
  const handlePress = () => {
    alert("Pressed");
  };

  const twoItems: Array<TabNavigationItem> = [
    { label: "Label tab", icon: "starEmpty", iconSelected: "starFilled" },
    { label: "Label tab", icon: "starEmpty", iconSelected: "starFilled" }
  ];
  const threeItems: Array<TabNavigationItem> = [
    { label: "Inquadra" },
    { label: "Carica" },
    { label: "Digita" }
  ];
  const fiveItems: Array<TabNavigationItem> = [
    { label: "Ricevuti", icon: "starEmpty", iconSelected: "starFilled" },
    { label: "Archiviati", icon: "starEmpty", iconSelected: "starFilled" },
    { label: "Preferiti", icon: "starEmpty", iconSelected: "starFilled" },
    { label: "Altro", icon: "starEmpty", iconSelected: "starFilled" },
    { label: "Altro", icon: "starEmpty", iconSelected: "starFilled" }
  ];

  return (
    <DesignSystemScreen
      title={DESIGN_SYSTEM_ROUTES.COMPONENTS.TAB_NAVIGATION.title}
      noMargin={true}
    >
      <ContentWrapper>
        <H2>Tab Item</H2>
        <VSpacer size={24} />

        <View style={[styles.default, { borderRadius: 16, padding: 16 }]}>
          <DSComponentViewerBox name="Light">
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

          <DSComponentViewerBox name="Light Selected" last={true}>
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

        <View style={[styles.dark, { borderRadius: 16, padding: 16 }]}>
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

          <DSComponentViewerBox
            name="Dark Selected"
            colorMode="dark"
            last={true}
          >
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

        <VSpacer size={32} />
        <H2>Tab Navigation</H2>
        <VSpacer size={24} />
      </ContentWrapper>

      <View style={[styles.default, { paddingVertical: 24 }]}>
        <TabNavigation items={twoItems} />
        <TabNavigation items={threeItems} />
        <TabNavigation items={fiveItems} />
      </View>

      <VSpacer size={24} />

      <View style={[styles.dark, { paddingVertical: 24 }]}>
        <TabNavigation items={twoItems} color="dark" />
        <TabNavigation items={threeItems} color="dark" />
        <TabNavigation items={fiveItems} color="dark" />
      </View>
    </DesignSystemScreen>
  );
};

const styles = StyleSheet.create({
  default: {
    backgroundColor: IOColors["blueIO-100"]
  },
  dark: {
    backgroundColor: IOColors["blueIO-850"]
  }
});
