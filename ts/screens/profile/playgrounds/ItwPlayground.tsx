import {
  ContentWrapper,
  Divider,
  H3,
  ListItemNav,
  VSpacer
} from "@pagopa/io-app-design-system";
import * as React from "react";
import { ScrollView } from "react-native-gesture-handler";
import { useHeaderSecondLevel } from "../../../hooks/useHeaderSecondLevel";
import ItwMarkdown from "../../../features/itwallet/discovery/components/ItwMarkdown";
import { useIONavigation } from "../../../navigation/params/AppParamsList";
import { ITW_ROUTES } from "../../../features/itwallet/navigation/routes";

// Sample markdown text
const sampleMarkdown = `
# I am a Header 1

## I am a Header 2

### I am a Header 3

#### I am a Header 4

##### I am a Header 5

###### I am a Header 6

A simple paragraph.
Text can be emphasized with *asterisk* or _underscore_.
If you need bold use **double asterisk**.
A worked link to [Google](https://www.google.com) with some text.
A malformed link [Error](httssdps://www.error.com) that show toast error.
`;

/**
 * ITW Playground screen
 * @returns a screen with a list of playgrounds for the ITW
 */
const ItwPlayground = () => {
  const navigation = useIONavigation();

  useHeaderSecondLevel({
    title: "ITW Playground"
  });

  const navigateToDiscovery = () => {
    navigation.navigate(ITW_ROUTES.MAIN, {
      screen: ITW_ROUTES.DISCOVERY.INFO
    });
  };

  return (
    <ScrollView>
      <ContentWrapper>
        {/* Discovery Playground */}
        <ListItemNav
          value="Discovery"
          accessibilityLabel={"Discovery Playground"}
          description="Start the discovery flow before activate IT-Wallet"
          onPress={() => navigateToDiscovery()}
        />
        <Divider />
        {/* Issuing eID Playground */}
        <ListItemNav
          value="Issuing (eID)"
          accessibilityLabel={"Issuing (eID) Playground"}
          description="Start the issuing flow choosing activation method to activate IT-Wallet and get your digital identity"
          onPress={() => undefined}
        />
        <Divider />
        {/* Issuing mDL Playground */}
        <ListItemNav
          value="Issuing (mDL)"
          accessibilityLabel={"Issuing (mDL) Playground"}
          description="Start the issuing flow to get your mobile driving license"
          onPress={() => undefined}
        />
        <Divider />
        {/* Issuing TS Playground */}
        <ListItemNav
          value="Issuing (TS)"
          accessibilityLabel={"Issuing (TS) Playground"}
          description="Start the issuing flow to get your health card"
          onPress={() => undefined}
        />
        <Divider />
        <VSpacer />
        <H3>{"IT Wallet markdown preview"}</H3>
        {/* Markdown ITW Playground */}
        <ItwMarkdown content={sampleMarkdown} />
        {/* TODO: Add more items here */}
      </ContentWrapper>
    </ScrollView>
  );
};

export default ItwPlayground;
