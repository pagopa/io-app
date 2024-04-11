import {
  ContentWrapper,
  Divider,
  ListItemNav
} from "@pagopa/io-app-design-system";
import * as React from "react";
import { ScrollView } from "react-native-gesture-handler";
import { useHeaderSecondLevel } from "../../../hooks/useHeaderSecondLevel";

/**
 * ITW Playground screen
 * @returns a screen with a list of playgrounds for the ITW
 */
const ItwPlayground = () => {
  useHeaderSecondLevel({
    title: "ITW Playground"
  });

  return (
    <ScrollView>
      <ContentWrapper>
        {/* Discovery Playground */}
        <ListItemNav
          value="Discovery"
          accessibilityLabel={"Discovery Playground"}
          description="Start the discovery flow before activate IT-Wallet"
          onPress={() => undefined}
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
        {/* TODO: Add more items here */}
      </ContentWrapper>
    </ScrollView>
  );
};

export default ItwPlayground;
