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
import { ItwCardsHeaderSection } from "../components/ItwCardsHeaderSection";
import { ItwCardsSection } from "../components/ItwCardsSection";
import { ItwComponentsSection } from "../components/ItwComponentsSection";
import { ItwCredentialStatusOverrideSection } from "../components/ItwCredentialStatusOverrideSection";
import { ItwEnvironmentSection } from "../components/ItwEnvironmentSection";
import { ItwIdentificationScreensSection } from "../components/ItwIdentificationScreensSection";
import { ItwL3ScreensSection } from "../components/ItwL3ScreensSection";
import { ItwLifecycleSection } from "../components/ItwLifecycleSection";
import { ItwMiscSection } from "../components/ItwMiscSection";
import { ItwPidIssuanceSection } from "../components/ItwPidIssuanceSection";
import { ItwSpecsVersionSection } from "../components/ItwSpecsVersionSection";

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
    <VStack space={16} style={{ flex: 1 }}>
      <TabNavigation
        tabAlignment="start"
        selectedIndex={page}
        onItemPress={setPage}
      >
        <TabItem label="Environment" accessibilityLabel="Environment" />
        <TabItem label="Issuance" accessibilityLabel="Issuance" />
        <TabItem label="Status" accessibilityLabel="Status" />
        <TabItem label="Screens" accessibilityLabel="Screens" />
        <TabItem label="Components" accessibilityLabel="Components" />
        <TabItem label="Cards" accessibilityLabel="Cards" />
        <TabItem label="Header Cards" accessibilityLabel="Header Cards" />
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
              <ItwSpecsVersionSection />
              <ItwMiscSection />
            </>
          )}
          {page === 1 && <ItwPidIssuanceSection />}
          {page === 2 && <ItwCredentialStatusOverrideSection />}
          {page === 3 && (
            <>
              <ItwL3ScreensSection />
              <ItwIdentificationScreensSection />
            </>
          )}
          {page === 4 && <ItwComponentsSection />}
          {page === 5 && <ItwCardsSection />}
          {page === 6 && <ItwCardsHeaderSection />}
        </ContentWrapper>
      </ScrollView>
    </VStack>
  );
};

export default ItwPlayground;
