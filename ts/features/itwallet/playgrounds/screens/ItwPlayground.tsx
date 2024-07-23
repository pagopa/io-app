import {
  ContentWrapper,
  Divider,
  H3,
  ListItemHeader,
  ListItemNav,
  VSpacer
} from "@pagopa/io-app-design-system";
import { useFocusEffect } from "@react-navigation/native";
import * as React from "react";
import { ScrollView } from "react-native-gesture-handler";
import { useHeaderSecondLevel } from "../../../../hooks/useHeaderSecondLevel";
import { useIONavigation } from "../../../../navigation/params/AppParamsList";
import ItwMarkdown from "../../common/components/ItwMarkdown";
import {
  ItwCredentialIssuanceMachineContext,
  ItwEidIssuanceMachineContext
} from "../../machine/provider";
import { ITW_ROUTES } from "../../navigation/routes";
import { ItwLifecycleSection } from "../components/ItwLifecycleSection";
import { ItwTrialSystemSection } from "../components/ItwTrialSystemSection";

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
  const eidMachineRef = ItwEidIssuanceMachineContext.useActorRef();
  const credentialMachineRef =
    ItwCredentialIssuanceMachineContext.useActorRef();

  useFocusEffect(
    React.useCallback(() => {
      // Resets the machine in case they were left in s failure state
      eidMachineRef.send({ type: "reset" });
      credentialMachineRef.send({ type: "reset" });
    }, [eidMachineRef, credentialMachineRef])
  );

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
        {/* Activation Playground */}
        <ListItemHeader label="Activation" />
        <ListItemNav
          value="Wallet activation"
          accessibilityLabel={"Discovery Playground"}
          description="Start the eID issuing flow"
          onPress={navigateToDiscovery}
        />
        <VSpacer size={16} />
        {/* Issuing Playground */}
        <ListItemHeader label="Credentials issuing" />
        <ListItemNav
          value="mDL issuing"
          accessibilityLabel={"mDL Issuing"}
          description="Start the issuing flow to get your mobile driving license"
          onPress={() => undefined}
        />
        <Divider />
        <ListItemNav
          value="TS issuing"
          accessibilityLabel={"TS Issuing"}
          description="Start the issuing flow to get your health insurance card"
          onPress={() => undefined}
        />
        <Divider />
        <ListItemNav
          value="DC issuing"
          accessibilityLabel={"DC Issuing"}
          description="Start the issuing flow to get your european disability card card"
          onPress={() => undefined}
        />
        <VSpacer size={16} />
        {
          /* F&F Experimentation */
          __DEV__ ? (
            <>
              <ItwLifecycleSection />
              <VSpacer size={16} />
              <ItwTrialSystemSection />
              <VSpacer size={16} />
            </>
          ) : null
        }
        {/* Other Playgrounds */}
        <ListItemHeader label="Miscellaneous" />
        <H3>{"IT Wallet markdown preview"}</H3>
        <VSpacer size={8} />
        <ItwMarkdown>{sampleMarkdown}</ItwMarkdown>
        {/* TODO: Add more items here */}
        <VSpacer size={32} />
      </ContentWrapper>
    </ScrollView>
  );
};

export default ItwPlayground;
