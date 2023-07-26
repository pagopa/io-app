/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable arrow-body-style */
import * as React from "react";

import { StyleSheet, View } from "react-native";
import DESIGN_SYSTEM_ROUTES from "../navigation/routes";

import { HSpacer, VSpacer } from "../../../components/core/spacer/Spacer";
import { H2 } from "../../../components/core/typography/H2";
import { IOColors } from "../../../components/core/variables/IOColors";
import { TabItem } from "../../../components/ui/TabItem";
import { DSComponentViewerBox } from "../components/DSComponentViewerBox";
import { DesignSystemScreen } from "../components/DesignSystemScreen";
import { ContentWrapper } from "../../../components/core/ContentWrapper";
import { H3 } from "../../../components/core/typography/H3";

export const DSTabNavigation = () => {
  const handlePress = () => {};

  return (
    <DesignSystemScreen
      title={DESIGN_SYSTEM_ROUTES.COMPONENTS.TAB_NAVIGATION.title}
      noMargin={true}
    >
      <ContentWrapper>
        <H2>Tab Item</H2>
        <VSpacer size={24} />
        <H3>Light</H3>
        <VSpacer size={16} />
        <View style={[styles.default, { borderRadius: 16, padding: 16 }]}>
          <DSComponentViewerBox name="Light">
            <View style={{ flexDirection: "row" }}>
              <TabItem
                label="Label tab"
                accessibilityLabel="Label tab"
                onPress={handlePress}
              />
              <HSpacer size={8} />
              <TabItem
                label="Label tab"
                accessibilityLabel="Label tab"
                icon={"starEmpty"}
                iconSelected={"starFilled"}
                onPress={handlePress}
              />
            </View>
          </DSComponentViewerBox>

          <DSComponentViewerBox name="Light Selected" last={true}>
            <View style={{ flexDirection: "row" }}>
              <TabItem
                label="Label tab"
                accessibilityLabel="Label tab"
                selected={true}
                onPress={handlePress}
              />
              <HSpacer size={8} />
              <TabItem
                label="Label tab"
                accessibilityLabel="Label tab"
                icon={"starEmpty"}
                iconSelected={"starFilled"}
                selected={true}
                onPress={handlePress}
              />
            </View>
          </DSComponentViewerBox>
        </View>
        <VSpacer size={24} />
        <H3>Dark</H3>
        <VSpacer size={16} />
        <View style={[styles.dark, { borderRadius: 16, padding: 16 }]}>
          <DSComponentViewerBox name="Dark" colorMode="dark">
            <View style={{ flexDirection: "row" }}>
              <TabItem
                label="Label tab"
                accessibilityLabel="Label tab"
                color="dark"
                onPress={handlePress}
              />
              <HSpacer size={8} />
              <TabItem
                label="Label tab"
                accessibilityLabel="Label tab"
                icon={"starEmpty"}
                iconSelected={"starFilled"}
                color="dark"
                onPress={handlePress}
              />
            </View>
          </DSComponentViewerBox>

          <DSComponentViewerBox
            name="Dark Selected"
            colorMode="dark"
            last={true}
          >
            <View style={{ flexDirection: "row" }}>
              <TabItem
                label="Label tab"
                accessibilityLabel="Label tab"
                color="dark"
                selected={true}
                onPress={handlePress}
              />
              <HSpacer size={8} />
              <TabItem
                label="Label tab"
                accessibilityLabel="Label tab"
                icon={"starEmpty"}
                iconSelected={"starFilled"}
                color="dark"
                selected={true}
                onPress={handlePress}
              />
            </View>
          </DSComponentViewerBox>
        </View>
        <VSpacer size={32} />
      </ContentWrapper>
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
