import {
  BodyMonospace,
  ContentWrapper,
  H4,
  H6,
  HStack,
  IOColorPalette,
  TabItem,
  TabNavigation,
  VStack
} from "@io-app/design-system";
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

const blueBackground = IOColorPalette.blueIO[850];

export const DSTabNavigation = () => (
  <DesignSystemScreen
    noMargin={true}
    title={DESIGN_SYSTEM_ROUTES.COMPONENTS.TAB_NAVIGATION.title}
  >
    <VStack space={blockMargin}>
      <ContentWrapper>
        <VStack space={blockTitleMargin}>
          <H4>Tab Item</H4>

          <VStack space={innerBlockMargin}>
            <VStack space={sectionTitleMargin}>
              <H6>Primary</H6>
              {renderTabItemPrimary()}
            </VStack>

            <VStack space={sectionTitleMargin}>
              <H6>Contrast</H6>
              {renderTabItemContrast()}
            </VStack>
          </VStack>
        </VStack>
      </ContentWrapper>

      <VStack space={blockTitleMargin}>
        <ContentWrapper>
          <H4>Tab Navigation</H4>
        </ContentWrapper>

        <VStack space={innerBlockMargin}>
          <VStack space={sectionTitleMargin}>
            <ContentWrapper>
              <H6>Primary</H6>
            </ContentWrapper>
            {renderTabNavigationPrimary()}
          </VStack>

          <VStack space={sectionTitleMargin}>
            <ContentWrapper>
              <H6>Contrast</H6>
            </ContentWrapper>
            {renderTabNavigationContrast()}
          </VStack>
        </VStack>
      </VStack>

      <VStack space={blockTitleMargin}>
        <ContentWrapper>
          <H4>Tab Alignment</H4>
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

const TabNavigationWithState = (props: TabNavigation) => {
  const [index, setIndex] = useState(0);

  return (
    <TabNavigation {...props} onItemPress={setIndex} selectedIndex={index}>
      {props.children}
    </TabNavigation>
  );
};

const renderTabItemPrimary = () => (
  <VStack space={componentMargin}>
    <DSComponentViewerBox name="Primary">
      <HStack space={tabItemMargin}>
        <TabItem accessibilityLabel="Label tab" label="Label tab" />
        <TabItem
          accessibilityLabel="Label tab"
          icon={"starEmpty"}
          label="Label tab"
        />
      </HStack>
    </DSComponentViewerBox>

    <DSComponentViewerBox name="Primary · Selected">
      <HStack space={tabItemMargin}>
        <TabItem
          accessibilityLabel="Label tab"
          label="Label tab"
          selected={true}
        />
        <TabItem
          accessibilityLabel="Label tab"
          icon={"starEmpty"}
          label="Label tab"
          selected={true}
        />
      </HStack>
    </DSComponentViewerBox>

    <DSComponentViewerBox name="Primary · Disabled">
      <HStack space={tabItemMargin}>
        <TabItem accessibilityLabel="Label tab" disabled label="Label tab" />
        <TabItem
          accessibilityLabel="Label tab"
          disabled
          icon={"starEmpty"}
          label="Label tab"
        />
      </HStack>
    </DSComponentViewerBox>
  </VStack>
);

const renderTabItemContrast = () => (
  <View
    style={{
      backgroundColor: blueBackground,
      borderRadius: 24,
      padding: 24,
      borderCurve: "continuous"
    }}
  >
    <VStack space={componentMargin}>
      <DSComponentViewerBox colorMode="dark" name="Contrast">
        <HStack space={tabItemMargin}>
          <TabItem
            accessibilityLabel="Label tab"
            color="contrast"
            label="Label tab"
          />
          <TabItem
            accessibilityLabel="Label tab"
            color="contrast"
            icon={"starEmpty"}
            label="Label tab"
          />
        </HStack>
      </DSComponentViewerBox>

      <DSComponentViewerBox colorMode="dark" name="Contrast · Selected">
        <HStack space={tabItemMargin}>
          <TabItem
            accessibilityLabel="Label tab"
            color="contrast"
            label="Label tab"
            selected={true}
          />
          <TabItem
            accessibilityLabel="Label tab"
            color="contrast"
            icon={"starFilled"}
            label="Label tab"
            selected={true}
          />
        </HStack>
      </DSComponentViewerBox>

      <DSComponentViewerBox colorMode="dark" name="Contrast · Disabled">
        <HStack space={tabItemMargin}>
          <TabItem
            accessibilityLabel="Label tab"
            color="contrast"
            disabled={true}
            label="Label tab"
          />
          <TabItem
            accessibilityLabel="Label tab"
            color="contrast"
            disabled={true}
            icon={"starEmpty"}
            label="Label tab"
          />
        </HStack>
      </DSComponentViewerBox>
    </VStack>
  </View>
);

const renderTabNavigationPrimary = () => (
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

const renderTabNavigationContrast = () => (
  <View style={{ paddingVertical: 24, backgroundColor: blueBackground }}>
    <VStack space={componentMargin}>
      <TabNavigationWithState color="contrast">
        <TabItem accessibilityLabel="Label tab" label="Label tab" />
        <TabItem accessibilityLabel="Label tab" label="Label tab" />
      </TabNavigationWithState>

      <TabNavigationWithState color="contrast">
        <TabItem accessibilityLabel="Label tab" label="Label tab" />
        <TabItem accessibilityLabel="Label tab" label="Label tab" />
        <TabItem accessibilityLabel="Label tab" label="Label tab" />
      </TabNavigationWithState>

      <TabNavigationWithState color="contrast">
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
