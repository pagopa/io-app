import {
  ContentWrapper,
  Divider,
  ListItemHeader,
  ListItemNav,
  VSpacer
} from "@pagopa/io-app-design-system";
import { useFocusEffect } from "@react-navigation/native";
import { useCallback } from "react";
import { ScrollView } from "react-native-gesture-handler";
import { useHeaderSecondLevel } from "../../../../hooks/useHeaderSecondLevel";
import { CredentialType } from "../../common/utils/itwMocksUtils";
import { ItwCredentialIssuanceMachineContext } from "../../machine/provider";
import { ItwLifecycleSection } from "../components/ItwLifecycleSection";
import { ItwSkeumorphicCredentialSection } from "../components/ItwSkeumorphicCredentialSection";
import { useIONavigation } from "../../../../navigation/params/AppParamsList";
import { ITW_ROUTES } from "../../navigation/routes";

/**
 * ITW Playground screen
 * @returns a screen with a list of playgrounds for the ITW
 */
const ItwPlayground = () => {
  const navigation = useIONavigation();
  const credentialMachineRef =
    ItwCredentialIssuanceMachineContext.useActorRef();

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
        <ListItemNav
          value="Offline wallet"
          accessibilityLabel={"Offline wallet"}
          description="Navigate to the offline version of the wallet"
          onPress={() =>
            navigation.navigate(ITW_ROUTES.MAIN, {
              screen: ITW_ROUTES.OFFLINE.WALLET
            })
          }
        />
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
        <VSpacer size={16} />
        <ItwLifecycleSection />
        <VSpacer size={16} />
        {/* Other Playgrounds */}
        <ListItemHeader label="Miscellaneous" />
        <ItwSkeumorphicCredentialSection />
      </ContentWrapper>
    </ScrollView>
  );
};

export default ItwPlayground;
