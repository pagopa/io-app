/* eslint-disable sonarjs/no-identical-functions */
/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable arrow-body-style */
import * as React from "react";

import { StyleSheet, View } from "react-native";
import {
  IOColors,
  HSpacer,
  VSpacer,
  ContentWrapper
} from "@pagopa/io-app-design-system";
import DESIGN_SYSTEM_ROUTES from "../navigation/routes";

import { H2 } from "../../../components/core/typography/H2";
import { H3 } from "../../../components/core/typography/H3";
import { Monospace } from "../../../components/core/typography/Monospace";
import { TabItem } from "../../../components/ui/TabItem";
import { TabNavigation } from "../../../components/ui/TabNavigation";
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
      <ContentWrapper>
        <H2>Tab Navigation</H2>
        <VSpacer size={24} />
        <H3>Light</H3>
        <VSpacer size={16} />
      </ContentWrapper>
      <View style={[styles.default, { paddingVertical: 24 }]}>
        <TabNavigation>
          <TabItem label="Label tab" accessibilityLabel="Label tab" />
          <TabItem label="Label tab" accessibilityLabel="Label tab" />
        </TabNavigation>

        <VSpacer size={24} />

        <TabNavigation>
          <TabItem label="Label tab" accessibilityLabel="Label tab" />
          <TabItem label="Label tab" accessibilityLabel="Label tab" />
          <TabItem label="Label tab" accessibilityLabel="Label tab" />
        </TabNavigation>

        <VSpacer size={24} />

        <TabNavigation>
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
        </TabNavigation>
      </View>

      <ContentWrapper>
        <VSpacer size={24} />
        <H3>Dark</H3>
        <VSpacer size={16} />
      </ContentWrapper>

      <View style={[styles.dark, { paddingVertical: 24 }]}>
        <TabNavigation color="dark">
          <TabItem label="Label tab" accessibilityLabel="Label tab" />
          <TabItem label="Label tab" accessibilityLabel="Label tab" />
        </TabNavigation>

        <VSpacer size={24} />

        <TabNavigation color="dark">
          <TabItem label="Label tab" accessibilityLabel="Label tab" />
          <TabItem label="Label tab" accessibilityLabel="Label tab" />
          <TabItem label="Label tab" accessibilityLabel="Label tab" />
        </TabNavigation>

        <VSpacer size={24} />

        <TabNavigation color="dark">
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
        </TabNavigation>
      </View>

      <ContentWrapper>
        <VSpacer size={24} />
        <H3>Tab alignment</H3>
        <VSpacer size={16} />
      </ContentWrapper>

      <View style={[styles.default, { paddingVertical: 24 }]}>
        <ContentWrapper>
          <Monospace>{`center (default)`}</Monospace>
        </ContentWrapper>

        <VSpacer size={16} />

        <TabNavigation>
          <TabItem label="Long label" accessibilityLabel="Long label" />
          <TabItem label="Label" accessibilityLabel="Label" />
          <TabItem label="Label" accessibilityLabel="Label" />
        </TabNavigation>

        <VSpacer size={24} />

        <ContentWrapper>
          <Monospace>{`start`}</Monospace>
        </ContentWrapper>

        <VSpacer size={16} />

        <TabNavigation tabAlignment="start">
          <TabItem label="Long label" accessibilityLabel="Long label" />
          <TabItem label="Label" accessibilityLabel="Label" />
          <TabItem label="Label" accessibilityLabel="Label" />
        </TabNavigation>

        <VSpacer size={24} />

        <ContentWrapper>
          <Monospace>{`end`}</Monospace>
        </ContentWrapper>

        <VSpacer size={16} />

        <TabNavigation tabAlignment="end">
          <TabItem label="Long label" accessibilityLabel="Long label" />
          <TabItem label="Label" accessibilityLabel="Label" />
          <TabItem label="Label" accessibilityLabel="Label" />
        </TabNavigation>

        <VSpacer size={24} />

        <ContentWrapper>
          <Monospace>{`stretch`}</Monospace>
        </ContentWrapper>

        <VSpacer size={16} />

        <TabNavigation tabAlignment="stretch">
          <TabItem label="Long label" accessibilityLabel="Long label" />
          <TabItem label="Label" accessibilityLabel="Label" />
          <TabItem label="Label" accessibilityLabel="Label" />
        </TabNavigation>
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
