import {
  ContentWrapper,
  TabItem,
  TabNavigation,
  VStack
} from "@pagopa/io-app-design-system";
import { useFocusEffect } from "@react-navigation/native";
import { useCallback, useState } from "react";
import { ScrollView } from "react-native";
import { useHeaderSecondLevel } from "../../../../hooks/useHeaderSecondLevel";
import { useScreenEndMargin } from "../../../../hooks/useScreenEndMargin";
import { ItwEidIssuanceMachineContext } from "../../machine/eid/provider";
import { ItwBannerSection } from "../components/ItwBannerSection";
import { ItwClaimsListSection } from "../components/ItwClaimsListSection";
import { ItwEnvironmentSection } from "../components/ItwEnvironmentSection";
import { ItwIdentificationScreensSection } from "../components/ItwIdentificationScreensSection";
import { ItwL3ScreensSection } from "../components/ItwL3ScreensSection";
import { ItwLifecycleSection } from "../components/ItwLifecycleSection";
import { ItwPidIssuanceSection } from "../components/ItwPidIssuanceSection";
import { ItwSkeumorphicCredentialSection } from "../components/ItwSkeumorphicCredentialSection";
import { ItwWalletIdStatusSection } from "../components/ItwWalletIdStatusSection";

/**
 * ITW Playground screen
 * @returns a screen with a list of playgrounds for the ITW
 */
const ItwPlayground = () => {
  const eidMachineRef = ItwEidIssuanceMachineContext.useActorRef();
  const { screenEndMargin } = useScreenEndMargin();
  const [page, setPage] = useState(0);

  useHeaderSecondLevel({
    title: "Documenti su IO - Playgrounds"
  });

  useFocusEffect(
    useCallback(() => {
      eidMachineRef.send({ type: "reset" });
    }, [eidMachineRef])
  );

  return (
    <VStack space={16}>
      <TabNavigation
        tabAlignment="start"
        selectedIndex={page}
        onItemPress={setPage}
      >
        <TabItem label="Environment" accessibilityLabel="Environment" />
        <TabItem label="Issuance" accessibilityLabel="Issuance" />
        <TabItem label="Screens" accessibilityLabel="Screens" />
        <TabItem label="Components" accessibilityLabel="Components" />
      </TabNavigation>
      <ScrollView
        contentContainerStyle={{
          paddingBottom: screenEndMargin
        }}
      >
        <ContentWrapper>
          {page === 0 && (
            <>
              <ItwEnvironmentSection />
              <ItwLifecycleSection />
            </>
          )}
          {page === 1 && (
            <>
              <ItwPidIssuanceSection />
            </>
          )}
          {page === 2 && (
            <>
              <ItwL3ScreensSection />
              <ItwIdentificationScreensSection />
            </>
          )}
          {page === 3 && (
            <>
              <ItwWalletIdStatusSection />
              <ItwSkeumorphicCredentialSection />
              <ItwBannerSection />
              <ItwClaimsListSection />
            </>
          )}
        </ContentWrapper>
      </ScrollView>
    </VStack>
  );
};

export default ItwPlayground;
