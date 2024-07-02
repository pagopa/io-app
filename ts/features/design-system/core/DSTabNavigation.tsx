/* eslint-disable @typescript-eslint/no-empty-function */

import * as React from "react";

import { StyleSheet, View } from "react-native";
import {
  IOColors,
  HSpacer,
  VSpacer,
  ContentWrapper,
  TabItem,
  BodyMonospace,
  TabNavigation
} from "@pagopa/io-app-design-system";
import DESIGN_SYSTEM_ROUTES from "../navigation/routes";

import { H2 } from "../../../components/core/typography/H2";
import { H3 } from "../../../components/core/typography/H3";
import { DSComponentViewerBox } from "../components/DSComponentViewerBox";
import { DesignSystemScreen } from "../components/DesignSystemScreen";

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
        <View>
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
                onPress={handlePress}
              />
            </View>
          </DSComponentViewerBox>

          <DSComponentViewerBox name="Light Selected">
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
                selected={true}
                onPress={handlePress}
              />
            </View>
          </DSComponentViewerBox>

          <DSComponentViewerBox name="Light Disabled" last={true}>
            <View style={{ flexDirection: "row" }}>
              <TabItem
                label="Label tab"
                accessibilityLabel="Label tab"
                disabled
                onPress={handlePress}
              />
              <HSpacer size={8} />
              <TabItem
                label="Label tab"
                accessibilityLabel="Label tab"
                disabled
                icon={"starEmpty"}
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
                color="dark"
                onPress={handlePress}
              />
            </View>
          </DSComponentViewerBox>

          <DSComponentViewerBox name="Dark Selected" colorMode="dark">
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
                color="dark"
                selected={true}
                onPress={handlePress}
              />
            </View>
          </DSComponentViewerBox>
          <DSComponentViewerBox
            name="Dark Disabled"
            colorMode="dark"
            last={true}
          >
            <View style={{ flexDirection: "row" }}>
              <TabItem
                label="Label tab"
                accessibilityLabel="Label tab"
                color="dark"
                disabled={true}
                onPress={handlePress}
              />
              <HSpacer size={8} />
              <TabItem
                label="Label tab"
                accessibilityLabel="Label tab"
                icon={"starEmpty"}
                color="dark"
                disabled={true}
                onPress={handlePress}
              />
            </View>
          </DSComponentViewerBox>
        </View>
        <VSpacer size={32} />
      </ContentWrapper>
      <ContentWrapper>
        <H2>Tab Navigation</H2>
        <VSpacer size={24} />
        <H3>Light</H3>
        <VSpacer size={16} />
      </ContentWrapper>
      <View>
        <TabNavigationWithState>
          <TabItem label="Label tab" accessibilityLabel="Label tab" />
          <TabItem label="Label tab" accessibilityLabel="Label tab" />
        </TabNavigationWithState>

        <VSpacer size={24} />

        <TabNavigationWithState>
          <TabItem label="Label tab" accessibilityLabel="Label tab" />
          <TabItem label="Label tab" accessibilityLabel="Label tab" />
          <TabItem label="Label tab" accessibilityLabel="Label tab" />
        </TabNavigationWithState>

        <VSpacer size={24} />

        <TabNavigationWithState>
          <TabItem
            label="Label tab"
            accessibilityLabel="Label tab"
            icon="starEmpty"
            iconSelected="starFilled"
          />
          <TabItem
            label="Label tab"
            accessibilityLabel="Label tab"
            icon="starEmpty"
            iconSelected="starFilled"
          />
          <TabItem
            label="Label tab"
            accessibilityLabel="Label tab"
            icon="starEmpty"
            iconSelected="starFilled"
          />
          <TabItem
            label="Label tab"
            accessibilityLabel="Label tab"
            icon="starEmpty"
            iconSelected="starFilled"
          />
          <TabItem
            label="Label tab"
            accessibilityLabel="Label tab"
            icon="starEmpty"
            iconSelected="starFilled"
          />
        </TabNavigationWithState>
      </View>

      <ContentWrapper>
        <VSpacer size={32} />
        <H3>Dark</H3>
        <VSpacer size={16} />
      </ContentWrapper>

      <View style={[styles.dark, { paddingVertical: 24 }]}>
        <TabNavigationWithState color="dark">
          <TabItem label="Label tab" accessibilityLabel="Label tab" />
          <TabItem label="Label tab" accessibilityLabel="Label tab" />
        </TabNavigationWithState>

        <VSpacer size={24} />

        <TabNavigationWithState color="dark">
          <TabItem label="Label tab" accessibilityLabel="Label tab" />
          <TabItem label="Label tab" accessibilityLabel="Label tab" />
          <TabItem label="Label tab" accessibilityLabel="Label tab" />
        </TabNavigationWithState>

        <VSpacer size={24} />

        <TabNavigationWithState color="dark">
          <TabItem
            label="Label tab"
            accessibilityLabel="Label tab"
            icon="starEmpty"
          />
          <TabItem
            label="Label tab"
            accessibilityLabel="Label tab"
            icon="starEmpty"
          />
          <TabItem
            label="Label tab"
            accessibilityLabel="Label tab"
            icon="starEmpty"
          />
          <TabItem
            label="Label tab"
            accessibilityLabel="Label tab"
            icon="starEmpty"
          />
          <TabItem
            label="Label tab"
            accessibilityLabel="Label tab"
            icon="starEmpty"
          />
        </TabNavigationWithState>
      </View>

      <ContentWrapper>
        <VSpacer size={24} />
        <H3>Tab alignment</H3>
        <VSpacer size={16} />
      </ContentWrapper>

      <View>
        <ContentWrapper>
          <BodyMonospace>{`center (default)`}</BodyMonospace>
        </ContentWrapper>

        <VSpacer size={16} />

        <TabNavigationWithState>
          <TabItem label="Long label" accessibilityLabel="Long label" />
          <TabItem label="Label" accessibilityLabel="Label" />
          <TabItem label="Label" accessibilityLabel="Label" />
        </TabNavigationWithState>

        <VSpacer size={24} />

        <ContentWrapper>
          <BodyMonospace>{`start`}</BodyMonospace>
        </ContentWrapper>

        <VSpacer size={16} />

        <TabNavigationWithState tabAlignment="start">
          <TabItem label="Long label" accessibilityLabel="Long label" />
          <TabItem label="Label" accessibilityLabel="Label" />
          <TabItem label="Label" accessibilityLabel="Label" />
        </TabNavigationWithState>

        <VSpacer size={24} />

        <ContentWrapper>
          <BodyMonospace>{`end`}</BodyMonospace>
        </ContentWrapper>

        <VSpacer size={16} />

        <TabNavigationWithState tabAlignment="end">
          <TabItem label="Long label" accessibilityLabel="Long label" />
          <TabItem label="Label" accessibilityLabel="Label" />
          <TabItem label="Label" accessibilityLabel="Label" />
        </TabNavigationWithState>

        <VSpacer size={24} />

        <ContentWrapper>
          <BodyMonospace>{`stretch`}</BodyMonospace>
        </ContentWrapper>

        <VSpacer size={16} />

        <TabNavigationWithState tabAlignment="stretch">
          <TabItem label="Long label" accessibilityLabel="Long label" />
          <TabItem label="Label" accessibilityLabel="Label" />
          <TabItem label="Label" accessibilityLabel="Label" />
        </TabNavigationWithState>
      </View>
      <VSpacer size={40} />
    </DesignSystemScreen>
  );
};

const TabNavigationWithState = (props: TabNavigation) => {
  const [index, setIndex] = React.useState(0);

  return (
    <TabNavigation {...props} selectedIndex={index} onItemPress={setIndex}>
      {props.children}
    </TabNavigation>
  );
};

const styles = StyleSheet.create({
  dark: {
    backgroundColor: IOColors["blueIO-850"]
  }
});
