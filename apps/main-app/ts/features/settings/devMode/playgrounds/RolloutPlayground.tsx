import { TabItem, TabNavigation, VStack } from "@io-app/design-system";
import { ReactNode, useState } from "react";

import { IOScrollView } from "../../../../components/ui/IOScrollView";
import { useHeaderSecondLevel } from "../../../../hooks/useHeaderSecondLevel";
import { DistributionSection } from "../components/rollout/DistributionSection";
import { OwnDeviceSection } from "../components/rollout/OwnDeviceSection";

type PlaygroundTab = {
  content: ReactNode;
  label: string;
};

/**
 * Playground to manually exercise `isFeatureEnabled` against both the real
 * device ID and a synthetic sample, to visually verify that the rollout is
 * uniformly distributed. Each tab is fully self-contained and generates
 * its own synthetic dataset when needed.
 */
export const RolloutPlayground = () => {
  const [page, setPage] = useState(0);

  useHeaderSecondLevel({
    title: "Feature Rollout Playground",
    canGoBack: true
  });

  const tabs: ReadonlyArray<PlaygroundTab> = [
    {
      label: "Device",
      content: <OwnDeviceSection />
    },
    {
      label: "Distribuzione",
      content: <DistributionSection />
    }
  ];

  return (
    <VStack space={16}>
      <TabNavigation
        onItemPress={setPage}
        selectedIndex={page}
        tabAlignment="start"
      >
        {tabs.map(({ label }) => (
          <TabItem accessibilityLabel={label} key={label} label={label} />
        ))}
      </TabNavigation>
      <IOScrollView>{tabs[page]?.content}</IOScrollView>
    </VStack>
  );
};
