import {
  ContentWrapper,
  TabItem,
  TabNavigation,
  VStack
} from "@pagopa/io-app-design-system";
import { useFocusEffect } from "@react-navigation/native";
import { ReactNode, useCallback, useState } from "react";
import { ScrollView } from "react-native";
import { useHeaderSecondLevel } from "../../../../hooks/useHeaderSecondLevel";
import { useScreenEndMargin } from "../../../../hooks/useScreenEndMargin";
import { isDevEnv } from "../../../../utils/environment";
import { ItwEidIssuanceMachineContext } from "../../machine/eid/provider";
import { ItwBackgroundTaskSection } from "../components/ItwBackgroundTaskSection";
import { ItwComponentsSection } from "../components/ItwComponentsSection";
import { ItwEnvironmentSection } from "../components/ItwEnvironmentSection";
import { ItwIdentificationScreensSection } from "../components/ItwIdentificationScreensSection";
import { ItwL3ScreensSection } from "../components/ItwL3ScreensSection";
import { ItwLifecycleSection } from "../components/ItwLifecycleSection";
import { ItwMiscSection } from "../components/ItwMiscSection";
import { ItwPidIssuanceSection } from "../components/ItwPidIssuanceSection";
import { ItwSpecsVersionSection } from "../components/ItwSpecsVersionSection";

type PlaygroundTab = {
  label: string;
  content: ReactNode;
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
    ...(isDevEnv
      ? [
          {
            label: "Task",
            content: <ItwBackgroundTaskSection />
          }
        ]
      : [])
  ];

  return (
    <VStack space={16} style={{ paddingBottom: screenEndMargin }}>
      <TabNavigation
        tabAlignment="start"
        selectedIndex={page}
        onItemPress={setPage}
      >
        {tabs.map(({ label }) => (
          <TabItem key={label} label={label} accessibilityLabel={label} />
        ))}
      </TabNavigation>
      <ScrollView contentContainerStyle={{ paddingBottom: screenEndSafeArea }}>
        <ContentWrapper>{tabs[page]?.content}</ContentWrapper>
      </ScrollView>
    </VStack>
  );
};

export default ItwPlayground;
