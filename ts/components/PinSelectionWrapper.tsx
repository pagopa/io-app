import * as React from "react";
import { KeyboardAvoidingView, Platform, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
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
  const headerHeight = useHeaderHeight();

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
      <KeyboardAvoidingView
        keyboardVerticalOffset={headerHeight}
        behavior={Platform.select({ ios: "padding", android: undefined })}
        style={IOStyles.flex}
        enabled
      >
        <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
          {children}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default PinSelectionWrapper;
