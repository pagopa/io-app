/* eslint-disable @typescript-eslint/no-empty-function */
import { useState } from "react";

import {
  BodyMonospace,
  ContentWrapper,
  H4,
  H6,
  HStack,
  IOColors,
  TabItem,
  TabNavigation,
  VStack,
  useIOTheme
} from "@pagopa/io-app-design-system";
import { View } from "react-native";
import DESIGN_SYSTEM_ROUTES from "../navigation/routes";

import { DSComponentViewerBox } from "../components/DSComponentViewerBox";
import { DesignSystemScreen } from "../components/DesignSystemScreen";

const tabItemMargin = 8;
const componentMargin = 16;
const innerBlockMargin = 24;
const sectionTitleMargin = 16;
const blockTitleMargin = 24;
const blockMargin = 48;

const blueBackground = IOColors["blueIO-850"];

const handlePress = () => {};

export const DSTabNavigation = () => {
  const theme = useIOTheme();

  return (
    <DesignSystemScreen
      title={DESIGN_SYSTEM_ROUTES.COMPONENTS.TAB_NAVIGATION.title}
      noMargin={true}
    >
      <VStack space={blockMargin}>
        <ContentWrapper>
          <VStack space={blockTitleMargin}>
            <H4 color={theme["textHeading-default"]}>Tab Item</H4>

            <VStack space={innerBlockMargin}>
              <VStack space={sectionTitleMargin}>
                <H6 color={theme["textHeading-default"]}>Light</H6>
                {renderTabItemLight()}
              </VStack>

              <VStack space={sectionTitleMargin}>
                <H6 color={theme["textHeading-default"]}>Dark</H6>
                {renderTabItemDark()}
              </VStack>
            </VStack>
          </VStack>
        </ContentWrapper>

        <VStack space={blockTitleMargin}>
          <ContentWrapper>
            <H4 color={theme["textHeading-default"]}>Tab Navigation</H4>
          </ContentWrapper>

          <VStack space={innerBlockMargin}>
            <VStack space={sectionTitleMargin}>
              <ContentWrapper>
                <H6 color={theme["textHeading-default"]}>Light</H6>
              </ContentWrapper>
              {renderTabNavigationLight()}
            </VStack>

            <VStack space={sectionTitleMargin}>
              <ContentWrapper>
                <H6 color={theme["textHeading-default"]}>Dark</H6>
              </ContentWrapper>
              {renderTabNavigationDark()}
            </VStack>
          </VStack>
        </VStack>

        <VStack space={blockTitleMargin}>
          <ContentWrapper>
            <H4 color={theme["textHeading-default"]}>Tab Alignment</H4>
          </ContentWrapper>

          <VStack space={innerBlockMargin}>
            <VStack space={sectionTitleMargin}>
              <ContentWrapper>
                <BodyMonospace style={{ alignSelf: "center" }}>
                  center (default)
                </BodyMonospace>
              </ContentWrapper>
              <TabNavigationWithState>
                <TabItem label="Long label" accessibilityLabel="Long label" />
                <TabItem label="Label" accessibilityLabel="Label" />
                <TabItem label="Label" accessibilityLabel="Label" />
              </TabNavigationWithState>
            </VStack>

            <VStack space={sectionTitleMargin}>
              <ContentWrapper>
                <BodyMonospace style={{ alignSelf: "flex-start" }}>
                  start
                </BodyMonospace>
              </ContentWrapper>
              <TabNavigationWithState tabAlignment="start">
                <TabItem label="Long label" accessibilityLabel="Long label" />
                <TabItem label="Label" accessibilityLabel="Label" />
                <TabItem label="Label" accessibilityLabel="Label" />
              </TabNavigationWithState>
            </VStack>

            <VStack space={sectionTitleMargin}>
              <ContentWrapper>
                <BodyMonospace style={{ alignSelf: "flex-end" }}>
                  end
                </BodyMonospace>
              </ContentWrapper>
              <TabNavigationWithState tabAlignment="end">
                <TabItem label="Long label" accessibilityLabel="Long label" />
                <TabItem label="Label" accessibilityLabel="Label" />
                <TabItem label="Label" accessibilityLabel="Label" />
              </TabNavigationWithState>
            </VStack>

            <VStack space={sectionTitleMargin}>
              <ContentWrapper>
                <BodyMonospace style={{ alignSelf: "flex-start" }}>
                  stretch
                </BodyMonospace>
              </ContentWrapper>
              <TabNavigationWithState tabAlignment="stretch">
                <TabItem label="Long label" accessibilityLabel="Long label" />
                <TabItem label="Label" accessibilityLabel="Label" />
                <TabItem label="Label" accessibilityLabel="Label" />
              </TabNavigationWithState>
            </VStack>
          </VStack>
        </VStack>
      </VStack>
    </DesignSystemScreen>
  );
};

const TabNavigationWithState = (props: TabNavigation) => {
  const [index, setIndex] = useState(0);

  return (
    <TabNavigation {...props} selectedIndex={index} onItemPress={setIndex}>
      {props.children}
    </TabNavigation>
  );
};

const renderTabItemLight = () => (
  <VStack space={componentMargin}>
    <DSComponentViewerBox name="Light">
      <HStack space={tabItemMargin}>
        <TabItem
          label="Label tab"
          accessibilityLabel="Label tab"
          onPress={handlePress}
        />
        <TabItem
          label="Label tab"
          accessibilityLabel="Label tab"
          icon={"starEmpty"}
          onPress={handlePress}
        />
      </HStack>
    </DSComponentViewerBox>

    <DSComponentViewerBox name="Light · Selected">
      <HStack space={tabItemMargin}>
        <TabItem
          label="Label tab"
          accessibilityLabel="Label tab"
          selected={true}
          onPress={handlePress}
        />
        <TabItem
          label="Label tab"
          accessibilityLabel="Label tab"
          icon={"starEmpty"}
          selected={true}
          onPress={handlePress}
        />
      </HStack>
    </DSComponentViewerBox>

    <DSComponentViewerBox name="Light · Disabled">
      <HStack space={tabItemMargin}>
        <TabItem
          label="Label tab"
          accessibilityLabel="Label tab"
          disabled
          onPress={handlePress}
        />
        <TabItem
          label="Label tab"
          accessibilityLabel="Label tab"
          disabled
          icon={"starEmpty"}
          onPress={handlePress}
        />
      </HStack>
    </DSComponentViewerBox>
  </VStack>
);

const renderTabItemDark = () => (
  <View
    style={{
      backgroundColor: blueBackground,
      borderRadius: 24,
      padding: 24,
      borderCurve: "continuous"
    }}
  >
    <VStack space={componentMargin}>
      <DSComponentViewerBox name="Dark" colorMode="dark">
        <HStack space={tabItemMargin}>
          <TabItem
            label="Label tab"
            accessibilityLabel="Label tab"
            color="dark"
            onPress={handlePress}
          />
          <TabItem
            label="Label tab"
            accessibilityLabel="Label tab"
            icon={"starEmpty"}
            color="dark"
            onPress={handlePress}
          />
        </HStack>
      </DSComponentViewerBox>

      <DSComponentViewerBox name="Dark · Selected" colorMode="dark">
        <HStack space={tabItemMargin}>
          <TabItem
            label="Label tab"
            accessibilityLabel="Label tab"
            color="dark"
            selected={true}
            onPress={handlePress}
          />
          <TabItem
            label="Label tab"
            accessibilityLabel="Label tab"
            icon={"starFilled"}
            color="dark"
            selected={true}
            onPress={handlePress}
          />
        </HStack>
      </DSComponentViewerBox>

      <DSComponentViewerBox name="Dark · Disabled" colorMode="dark">
        <HStack space={tabItemMargin}>
          <TabItem
            label="Label tab"
            accessibilityLabel="Label tab"
            color="dark"
            disabled={true}
            onPress={handlePress}
          />
          <TabItem
            label="Label tab"
            accessibilityLabel="Label tab"
            icon={"starEmpty"}
            color="dark"
            disabled={true}
            onPress={handlePress}
          />
        </HStack>
      </DSComponentViewerBox>
    </VStack>
  </View>
);

const renderTabNavigationLight = () => (
  <VStack space={componentMargin}>
    <TabNavigationWithState>
      <TabItem label="Label tab" accessibilityLabel="Label tab" />
      <TabItem label="Label tab" accessibilityLabel="Label tab" />
    </TabNavigationWithState>

    <TabNavigationWithState>
      <TabItem label="Label tab" accessibilityLabel="Label tab" />
      <TabItem label="Label tab" accessibilityLabel="Label tab" />
      <TabItem label="Label tab" accessibilityLabel="Label tab" />
    </TabNavigationWithState>

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
  </VStack>
);

const renderTabNavigationDark = () => (
  <View style={{ paddingVertical: 24, backgroundColor: blueBackground }}>
    <VStack space={componentMargin}>
      <TabNavigationWithState color="dark">
        <TabItem label="Label tab" accessibilityLabel="Label tab" />
        <TabItem label="Label tab" accessibilityLabel="Label tab" />
      </TabNavigationWithState>

      <TabNavigationWithState color="dark">
        <TabItem label="Label tab" accessibilityLabel="Label tab" />
        <TabItem label="Label tab" accessibilityLabel="Label tab" />
        <TabItem label="Label tab" accessibilityLabel="Label tab" />
      </TabNavigationWithState>

      <TabNavigationWithState color="dark">
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
    </VStack>
  </View>
);
