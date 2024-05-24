import * as React from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  AppParamsList,
  IOStackNavigationRouteProps
} from "../navigation/params/AppParamsList";
import { useIOSelector } from "../store/hooks";
import { useOnboardingAbortAlert } from "../utils/hooks/useOnboardingAbortAlert";
import { isProfileFirstOnBoardingSelector } from "../store/reducers/profile";
import { getFlowType } from "../utils/analytics";
import { trackPinScreen } from "../screens/profile/analytics";
import { useOnFirstRender } from "../utils/hooks/useOnFirstRender";
import { useHeaderSecondLevel } from "../hooks/useHeaderSecondLevel";
import { ContextualHelpPropsMarkdown } from "./screens/BaseScreenComponent";
import { IOStyles } from "./core/variables/IOStyles";

type Props = Pick<IOStackNavigationRouteProps<AppParamsList>, "navigation"> & {
  isOnboarding?: boolean;
};

const contextualHelpMarkdown: ContextualHelpPropsMarkdown = {
  title: "onboarding.unlockCode.contextualHelpTitle",
  body: "onboarding.unlockCode.contextualHelpContent"
};

/**
 * A wrapper used to abstract the shell used in both `PinCreation` and `PinConfirmation` components.
 */
const PinSelectionWrapper = ({
  navigation,
  isOnboarding = false,
  children
}: React.PropsWithChildren<Props>) => {
  const onboardingAbortAlert = useOnboardingAbortAlert();
  const isFirstOnBoarding = useIOSelector(isProfileFirstOnBoardingSelector);

  useOnFirstRender(() => {
    trackPinScreen(getFlowType(isOnboarding, isFirstOnBoarding));
  });

  const goBack = React.useCallback(
    () =>
      isOnboarding ? onboardingAbortAlert.showAlert() : navigation.goBack(),
    [navigation, isOnboarding, onboardingAbortAlert]
  );

  useHeaderSecondLevel({
    title: "",
    supportRequest: true,
    contextualHelpMarkdown,
    goBack
  });

  return (
    <SafeAreaView edges={["bottom"]} style={IOStyles.flex}>
      {children}
    </SafeAreaView>
  );
};

export default PinSelectionWrapper;
