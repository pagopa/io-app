import { TabItem, TabNavigation, VStack } from "@io-app/design-system";
import { ReactNode, useState } from "react";

import { IOScrollView } from "../../../../components/ui/IOScrollView";
import { useHeaderSecondLevel } from "../../../../hooks/useHeaderSecondLevel";
import { LoginConfigScreenContent } from "../../common/components/LoginConfigScreenContent";
import { SessionSection } from "../components/SessionSection";

type PlaygroundTab = {
  content: ReactNode;
  label: string;
};

export const AuthenticationPlayground = () => {
  const [page, setPage] = useState(0);

  useHeaderSecondLevel({
    title: "Authentication - Playgrounds"
  });

  const tabs: ReadonlyArray<PlaygroundTab> = [
    {
      label: "Login Config",
      content: <LoginConfigScreenContent disabled={true} />
    },
    {
      label: "Session",
      content: <SessionSection />
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
