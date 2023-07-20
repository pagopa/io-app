import * as React from "react";

import { StyleSheet, View } from "react-native";
import DESIGN_SYSTEM_ROUTES from "../navigation/routes";

import { VSpacer } from "../../../components/core/spacer/Spacer";
import { H2 } from "../../../components/core/typography/H2";
import { IOColors } from "../../../components/core/variables/IOColors";
import { TabItem } from "../../../components/ui/TabItem";
import { useIOSelector } from "../../../store/hooks";
import { isDesignSystemEnabledSelector } from "../../../store/reducers/persistedPreferences";
import { DSComponentViewerBox } from "../components/DSComponentViewerBox";
import { DesignSystemScreen } from "../components/DesignSystemScreen";

export const DSTabNavigation = () => {
  const isDesignSystemEnabled = useIOSelector(isDesignSystemEnabledSelector);

  return (
    <DesignSystemScreen
      title={DESIGN_SYSTEM_ROUTES.COMPONENTS.TAB_NAVIGATION.title}
    >
      <H2>Tab Item</H2>
      <VSpacer size={24} />

      <DSComponentViewerBox name="Default">
        <TabItem label="Label tab" />
        <TabItem label="Label tab" icon="starEmpty" />
      </DSComponentViewerBox>

      <DSComponentViewerBox name="Selected">
        <TabItem label="Label tab" selected={true} />
        <TabItem label="Label tab" icon="starEmpty" selected={true} />
      </DSComponentViewerBox>

      <View
        style={
          isDesignSystemEnabled
            ? styles.primaryBlock
            : styles.primaryBlockLegacy
        }
      >
        <DSComponentViewerBox name="Dark" colorMode="dark">
          <TabItem label="Label tab" dark={true} />
          <TabItem label="Label tab" icon="starEmpty" dark={true} />
        </DSComponentViewerBox>

        <DSComponentViewerBox name="Dark Selected" colorMode="dark" last={true}>
          <TabItem label="Label tab" dark={true} selected={true} />
          <TabItem
            label="Label tab"
            icon="starEmpty"
            dark={true}
            selected={true}
          />
        </DSComponentViewerBox>
      </View>
    </DesignSystemScreen>
  );
};

const styles = StyleSheet.create({
  primaryBlockLegacy: {
    backgroundColor: IOColors.blue,
    padding: 16,
    borderRadius: 8
  },
  primaryBlock: {
    backgroundColor: IOColors["blueIO-500"],
    padding: 16,
    borderRadius: 16
  }
});
