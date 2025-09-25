import { ContentWrapper, VStack } from "@pagopa/io-app-design-system";
import { useFocusEffect } from "@react-navigation/native";
import { useCallback } from "react";
import { ScrollView } from "react-native";
import { useHeaderSecondLevel } from "../../../../hooks/useHeaderSecondLevel";
import { ItwBannerSection } from "../components/ItwBannerSection";
import { ItwL3Section } from "../components/ItwL3Section";
import { ItwLifecycleSection } from "../components/ItwLifecycleSection";
import { ItwSkeumorphicCredentialSection } from "../components/ItwSkeumorphicCredentialSection";
import { ItwEidIssuanceMachineContext } from "../../machine/eid/provider";
import { ItwEnvironmentSection } from "../components/ItwEnvironmentSection";
import { ItwClaimsList } from "../components/ItwClaimsList";
import { ItwL2Section } from "../components/ItwL2Section";

/**
 * ITW Playground screen
 * @returns a screen with a list of playgrounds for the ITW
 */
const ItwPlayground = () => {
  const eidMachineRef = ItwEidIssuanceMachineContext.useActorRef();

  useHeaderSecondLevel({
    title: "Documenti su IO - Playgrounds"
  });

  useFocusEffect(
    useCallback(() => {
      eidMachineRef.send({ type: "reset" });
    }, [eidMachineRef])
  );

  return (
    <ScrollView contentContainerStyle={{ paddingBottom: 64 }}>
      <ContentWrapper>
        <VStack space={8}>
          <ItwL3Section />
          <ItwLifecycleSection />
          <ItwEnvironmentSection />
          <ItwL2Section />
          <ItwSkeumorphicCredentialSection />
          <ItwBannerSection />
          <ItwClaimsList />
        </VStack>
      </ContentWrapper>
    </ScrollView>
  );
};

export default ItwPlayground;
