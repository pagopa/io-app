import {
  BodyMonospace,
  ContentWrapper,
  H4,
  H6,
  HStack,
  IOColors,
  TabItem,
  TabNavigation,
  useIOTheme,
  VStack
} from "@pagopa/io-app-design-system";
import { useState } from "react";
import { View } from "react-native";

import { DesignSystemScreen } from "../components/DesignSystemScreen";
import { DSComponentViewerBox } from "../components/DSComponentViewerBox";
import DESIGN_SYSTEM_ROUTES from "../navigation/routes";

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
      noMargin={true}
      title={DESIGN_SYSTEM_ROUTES.COMPONENTS.TAB_NAVIGATION.title}
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
                <TabItem accessibilityLabel="Long label" label="Long label" />
                <TabItem accessibilityLabel="Label" label="Label" />
                <TabItem accessibilityLabel="Label" label="Label" />
              </TabNavigationWithState>
            </VStack>

            <VStack space={sectionTitleMargin}>
              <ContentWrapper>
                <BodyMonospace style={{ alignSelf: "flex-start" }}>
                  start
                </BodyMonospace>
              </ContentWrapper>
              <TabNavigationWithState tabAlignment="start">
                <TabItem accessibilityLabel="Long label" label="Long label" />
                <TabItem accessibilityLabel="Label" label="Label" />
                <TabItem accessibilityLabel="Label" label="Label" />
              </TabNavigationWithState>
            </VStack>

            <VStack space={sectionTitleMargin}>
              <ContentWrapper>
                <BodyMonospace style={{ alignSelf: "flex-end" }}>
                  end
                </BodyMonospace>
              </ContentWrapper>
              <TabNavigationWithState tabAlignment="end">
                <TabItem accessibilityLabel="Long label" label="Long label" />
                <TabItem accessibilityLabel="Label" label="Label" />
                <TabItem accessibilityLabel="Label" label="Label" />
              </TabNavigationWithState>
            </VStack>

            <VStack space={sectionTitleMargin}>
              <ContentWrapper>
                <BodyMonospace style={{ alignSelf: "flex-start" }}>
                  stretch
                </BodyMonospace>
              </ContentWrapper>
              <TabNavigationWithState tabAlignment="stretch">
                <TabItem accessibilityLabel="Long label" label="Long label" />
                <TabItem accessibilityLabel="Label" label="Label" />
                <TabItem accessibilityLabel="Label" label="Label" />
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
    <TabNavigation {...props} onItemPress={setIndex} selectedIndex={index}>
      {props.children}
    </TabNavigation>
  );
};

const renderTabItemLight = () => (
  <VStack space={componentMargin}>
    <DSComponentViewerBox name="Light">
      <HStack space={tabItemMargin}>
        <TabItem
          accessibilityLabel="Label tab"
          label="Label tab"
          onPress={handlePress}
        />
        <TabItem
          accessibilityLabel="Label tab"
          icon={"starEmpty"}
          label="Label tab"
          onPress={handlePress}
        />
      </HStack>
    </DSComponentViewerBox>

    <DSComponentViewerBox name="Light · Selected">
      <HStack space={tabItemMargin}>
        <TabItem
          accessibilityLabel="Label tab"
          label="Label tab"
          onPress={handlePress}
          selected={true}
        />
        <TabItem
          accessibilityLabel="Label tab"
          icon={"starEmpty"}
          label="Label tab"
          onPress={handlePress}
          selected={true}
        />
      </HStack>
    </DSComponentViewerBox>

    <DSComponentViewerBox name="Light · Disabled">
      <HStack space={tabItemMargin}>
        <TabItem
          accessibilityLabel="Label tab"
          disabled
          label="Label tab"
          onPress={handlePress}
        />
        <TabItem
          accessibilityLabel="Label tab"
          disabled
          icon={"starEmpty"}
          label="Label tab"
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
      <DSComponentViewerBox colorMode="dark" name="Dark">
        <HStack space={tabItemMargin}>
          <TabItem
            accessibilityLabel="Label tab"
            color="dark"
            label="Label tab"
            onPress={handlePress}
          />
          <TabItem
            accessibilityLabel="Label tab"
            color="dark"
            icon={"starEmpty"}
            label="Label tab"
            onPress={handlePress}
          />
        </HStack>
      </DSComponentViewerBox>

      <DSComponentViewerBox colorMode="dark" name="Dark · Selected">
        <HStack space={tabItemMargin}>
          <TabItem
            accessibilityLabel="Label tab"
            color="dark"
            label="Label tab"
            onPress={handlePress}
            selected={true}
          />
          <TabItem
            accessibilityLabel="Label tab"
            color="dark"
            icon={"starFilled"}
            label="Label tab"
            onPress={handlePress}
            selected={true}
          />
        </HStack>
      </DSComponentViewerBox>

      <DSComponentViewerBox colorMode="dark" name="Dark · Disabled">
        <HStack space={tabItemMargin}>
          <TabItem
            accessibilityLabel="Label tab"
            color="dark"
            disabled={true}
            label="Label tab"
            onPress={handlePress}
          />
          <TabItem
            accessibilityLabel="Label tab"
            color="dark"
            disabled={true}
            icon={"starEmpty"}
            label="Label tab"
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
      <TabItem accessibilityLabel="Label tab" label="Label tab" />
      <TabItem accessibilityLabel="Label tab" label="Label tab" />
    </TabNavigationWithState>

    <TabNavigationWithState>
      <TabItem accessibilityLabel="Label tab" label="Label tab" />
      <TabItem accessibilityLabel="Label tab" label="Label tab" />
      <TabItem accessibilityLabel="Label tab" label="Label tab" />
    </TabNavigationWithState>

    <TabNavigationWithState>
      <TabItem
        accessibilityLabel="Label tab"
        icon="starEmpty"
        iconSelected="starFilled"
        label="Label tab"
      />
      <TabItem
        accessibilityLabel="Label tab"
        icon="starEmpty"
        iconSelected="starFilled"
        label="Label tab"
      />
      <TabItem
        accessibilityLabel="Label tab"
        icon="starEmpty"
        iconSelected="starFilled"
        label="Label tab"
      />
      <TabItem
        accessibilityLabel="Label tab"
        icon="starEmpty"
        iconSelected="starFilled"
        label="Label tab"
      />
      <TabItem
        accessibilityLabel="Label tab"
        icon="starEmpty"
        iconSelected="starFilled"
        label="Label tab"
      />
    </TabNavigationWithState>
  </VStack>
);

const renderTabNavigationDark = () => (
  <View style={{ paddingVertical: 24, backgroundColor: blueBackground }}>
    <VStack space={componentMargin}>
      <TabNavigationWithState color="dark">
        <TabItem accessibilityLabel="Label tab" label="Label tab" />
        <TabItem accessibilityLabel="Label tab" label="Label tab" />
      </TabNavigationWithState>

      <TabNavigationWithState color="dark">
        <TabItem accessibilityLabel="Label tab" label="Label tab" />
        <TabItem accessibilityLabel="Label tab" label="Label tab" />
        <TabItem accessibilityLabel="Label tab" label="Label tab" />
      </TabNavigationWithState>

      <TabNavigationWithState color="dark">
        <TabItem
          accessibilityLabel="Label tab"
          icon="starEmpty"
          iconSelected="starFilled"
          label="Label tab"
        />
        <TabItem
          accessibilityLabel="Label tab"
          icon="starEmpty"
          iconSelected="starFilled"
          label="Label tab"
        />
        <TabItem
          accessibilityLabel="Label tab"
          icon="starEmpty"
          iconSelected="starFilled"
          label="Label tab"
        />
        <TabItem
          accessibilityLabel="Label tab"
          icon="starEmpty"
          iconSelected="starFilled"
          label="Label tab"
        />
        <TabItem
          accessibilityLabel="Label tab"
          icon="starEmpty"
          iconSelected="starFilled"
          label="Label tab"
        />
      </TabNavigationWithState>
    </VStack>
  </View>
);
