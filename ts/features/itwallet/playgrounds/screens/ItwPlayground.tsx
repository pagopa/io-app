import {
  ContentWrapper,
  Divider,
  H3,
  ListItemHeader,
  ListItemNav,
  VSpacer
} from "@pagopa/io-app-design-system";
import { useFocusEffect } from "@react-navigation/native";
import { useCallback } from "react";
import { ScrollView } from "react-native-gesture-handler";
import { useHeaderSecondLevel } from "../../../../hooks/useHeaderSecondLevel";
import ItwMarkdown from "../../common/components/ItwMarkdown";
import { CredentialType } from "../../common/utils/itwMocksUtils";
import { ItwCredentialIssuanceMachineContext } from "../../machine/provider";
import { ItwLifecycleSection } from "../components/ItwLifecycleSection";
import { ItwSkeumorphicCredentialSection } from "../components/ItwSkeumorphicCredentialSection";
import { useIONavigation } from "../../../../navigation/params/AppParamsList";
import { ITW_ROUTES } from "../../navigation/routes";

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
  const credentialMachineRef =
    ItwCredentialIssuanceMachineContext.useActorRef();
  const navigation = useIONavigation();

  useFocusEffect(
    useCallback(() => {
      // Resets the machine in case they were left in s failure state
      credentialMachineRef.send({ type: "reset" });
    }, [credentialMachineRef])
  );

  useHeaderSecondLevel({
    title: "ITW Playground"
  });

  const handleStartCredentialIssuance =
    (credentialType: CredentialType) => () => {
      credentialMachineRef.send({
        type: "select-credential",
        credentialType
      });
    };

  return (
    <ScrollView contentContainerStyle={{ paddingBottom: 64 }}>
      <ContentWrapper>
        {/* Issuing Playground */}
        <ListItemHeader label="Credentials issuing" />
        <ListItemNav
          value="mDL issuing"
          accessibilityLabel={"mDL Issuing"}
          description="Start the issuing flow to get your mobile driving license"
          onPress={handleStartCredentialIssuance(
            CredentialType.DRIVING_LICENSE
          )}
        />
        <Divider />
        <ListItemNav
          value="TS issuing"
          accessibilityLabel={"TS Issuing"}
          description="Start the issuing flow to get your health insurance card"
          onPress={handleStartCredentialIssuance(
            CredentialType.EUROPEAN_HEALTH_INSURANCE_CARD
          )}
        />
        <Divider />
        <ListItemNav
          value="DC issuing"
          accessibilityLabel={"DC Issuing"}
          description="Start the issuing flow to get your european disability card card"
          onPress={handleStartCredentialIssuance(
            CredentialType.EUROPEAN_DISABILITY_CARD
          )}
        />
        <ListItemHeader label="Verifiable presentation" />
        <ListItemNav
          value="Consent screen"
          accessibilityLabel="Consent screen"
          description="Consent screen with required and optional claims for verifiable presentations"
          onPress={() =>
            navigation.navigate(ITW_ROUTES.MAIN, {
              screen: ITW_ROUTES.PRESENTATION.VERIFIABLE_PRESENTATION_TRUST_RP
            })
          }
        />
        <VSpacer size={16} />
        <ItwLifecycleSection />
        <VSpacer size={16} />
        {/* Other Playgrounds */}
        <ListItemHeader label="Miscellaneous" />
        <H3>{"IT Wallet markdown preview"}</H3>
        <VSpacer size={8} />
        <ItwMarkdown>{sampleMarkdown}</ItwMarkdown>
        <VSpacer size={16} />
        <ItwSkeumorphicCredentialSection />
      </ContentWrapper>
    </ScrollView>
  );
};

export default ItwPlayground;
