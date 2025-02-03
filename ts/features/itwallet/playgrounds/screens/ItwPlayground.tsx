import {
  ContentWrapper,
  ListItemSwitch,
  VSpacer
} from "@pagopa/io-app-design-system";
import { ScrollView } from "react-native-gesture-handler";
import { useHeaderSecondLevel } from "../../../../hooks/useHeaderSecondLevel";
import { ItwLifecycleSection } from "../components/ItwLifecycleSection";
import { ItwSkeumorphicCredentialSection } from "../components/ItwSkeumorphicCredentialSection";
import { useIODispatch, useIOSelector } from "../../../../store/hooks";
import { isItwOfflineAccessEnabledSelector } from "../../../../store/reducers/persistedPreferences";
import { setItwOfflineAccessEnabled } from "../../../../store/actions/persistedPreferences";

/**
 * ITW Playground screen
 * @returns a screen with a list of playgrounds for the ITW
 */
const ItwPlayground = () => {
  const dispatch = useIODispatch();
  const isOfflineAccessEnabled = useIOSelector(
    isItwOfflineAccessEnabledSelector
  );

  useHeaderSecondLevel({
    title: "Documenti su IO Playgrounds"
  });

  return (
    <ScrollView contentContainerStyle={{ paddingBottom: 64 }}>
      <ContentWrapper>
        <ListItemSwitch
          label="Enable offline access"
          value={isOfflineAccessEnabled}
          onSwitchValueChange={() => {
            dispatch(setItwOfflineAccessEnabled(!isOfflineAccessEnabled));
          }}
        />
        <ItwLifecycleSection />
        <VSpacer size={16} />
        <ItwSkeumorphicCredentialSection />
      </ContentWrapper>
    </ScrollView>
  );
};

export default ItwPlayground;
