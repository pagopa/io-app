import {
  ContentWrapper,
  TabItem,
  TabNavigation,
  VStack
} from "@io-app/design-system";
import { useFocusEffect } from "@react-navigation/native";
import { ReactNode, useCallback, useState } from "react";
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
import { ItwIso18013Section } from "../components/ItwIso18013Section";
import { ItwL3ScreensSection } from "../components/ItwL3ScreensSection";
import { ItwLifecycleSection } from "../components/ItwLifecycleSection";
import { ItwMiscSection } from "../components/ItwMiscSection";
import { ItwPidIssuanceSection } from "../components/ItwPidIssuanceSection";
import { ItwSpecsVersionSection } from "../components/ItwSpecsVersionSection";
import { ItwStatusListSection } from "../components/ItwStatusListSection";

type PlaygroundTab = {
  content: ReactNode;
  label: string;
};

/**
 * ITW Playground screen
 * @returns a screen with a list of playgrounds for the ITW
 */
const ItwPlayground = () => {
  const eidMachineRef = ItwEidIssuanceMachineContext.useActorRef();
  const { screenEndMargin, screenEndSafeArea } = useScreenEndMargin();
  const [page, setPage] = useState(0);

  useHeaderSecondLevel({
    title: "Documenti su IO - Playgrounds"
  });

  useFocusEffect(
    useCallback(() => {
      eidMachineRef.send({ type: "reset" });
    }, [eidMachineRef])
  );

  const tabs: ReadonlyArray<PlaygroundTab> = [
    {
      label: "Environment",
      content: (
        <>
          <ItwEnvironmentSection />
          <ItwLifecycleSection />
          <ItwSpecsVersionSection />
          <ItwMiscSection />
        </>
      )
    },
    {
      label: "Issuance",
      content: <ItwPidIssuanceSection />
    },
    {
      label: "ISO-18013",
      content: <ItwIso18013Section />
    },
    {
      label: "Status",
      content: <ItwCredentialStatusOverrideSection />
    },
    {
      label: "Status List",
      content: <ItwStatusListSection />
    },
    {
      label: "Screens",
      content: (
        <>
          <ItwL3ScreensSection />
          <ItwIdentificationScreensSection />
        </>
      )
    },
    {
      label: "Components",
      content: <ItwComponentsSection />
    },
    {
      label: "Cards",
      content: <ItwCardsSection />
    },
    {
      label: "Header Cards",
      content: <ItwCardsHeaderSection />
    }
  ];

  return (
    <VStack space={16} style={{ paddingBottom: screenEndMargin }}>
      <TabNavigation
        onItemPress={setPage}
        selectedIndex={page}
        tabAlignment="start"
      >
        {tabs.map(({ label }) => (
          <TabItem accessibilityLabel={label} key={label} label={label} />
        ))}
      </TabNavigation>
      <ScrollView contentContainerStyle={{ paddingBottom: screenEndSafeArea }}>
        <ContentWrapper>{tabs[page]?.content}</ContentWrapper>
      </ScrollView>
    </VStack>
  );
};

export default ItwPlayground;
