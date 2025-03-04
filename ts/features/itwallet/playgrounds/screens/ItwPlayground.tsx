import { ContentWrapper, VStack } from "@pagopa/io-app-design-system";
import { ScrollView } from "react-native-gesture-handler";
import { useHeaderSecondLevel } from "../../../../hooks/useHeaderSecondLevel";
import { ItwLifecycleSection } from "../components/ItwLifecycleSection";
import { ItwOfflineSection } from "../components/ItwOfflineSection";
import { ItwSkeumorphicCredentialSection } from "../components/ItwSkeumorphicCredentialSection";
import { ItwRemotePresentationSection } from "../components/ItwRemotePresentationSection";

/**
 * ITW Playground screen
 * @returns a screen with a list of playgrounds for the ITW
 */
const ItwPlayground = () => {
  useHeaderSecondLevel({
    title: "Documenti su IO - Playgrounds"
  });

  return (
    <ScrollView contentContainerStyle={{ paddingBottom: 64 }}>
      <ContentWrapper>
        <VStack space={8}>
          <ItwOfflineSection />
          <ItwLifecycleSection />
          <ItwRemotePresentationSection />
          <ItwSkeumorphicCredentialSection />
        </VStack>
      </ContentWrapper>
    </ScrollView>
  );
};

export default ItwPlayground;
