import * as React from "react";
import { SafeAreaView } from "react-native";
import { useDispatch, useSelector } from "react-redux";
import BaseScreenComponent, {
  ContextualHelpPropsMarkdown
} from "../../components/screens/BaseScreenComponent";
import { LightModalContextInterface } from "../../components/ui/LightModal";
import I18n from "../../i18n";
import { useOnboardingAbortAlert } from "../../utils/hooks/useOnboardingAbortAlert";
import { safeSetPin } from "../../utils/keychain";
import { PinString } from "../../types/PinString";
import {
  assistanceToolRemoteConfig,
  handleSendAssistanceLog
} from "../../utils/supportAssistance";
import { assistanceToolConfigSelector } from "../../store/reducers/backendStatus";
import { createPinSuccess } from "../../store/actions/pinset";
import {
  AppParamsList,
  IOStackNavigationRouteProps
} from "../../navigation/params/AppParamsList";
import { PinCreationForm } from "../../components/PinCreationForm";

const contextualHelpMarkdown: ContextualHelpPropsMarkdown = {
  title: "onboarding.unlockCode.contextualHelpTitle",
  body: "onboarding.unlockCode.contextualHelpContent"
};

type Props = IOStackNavigationRouteProps<AppParamsList> &
  LightModalContextInterface;

/**
 * A screen that allows the user to set the unlock code.
 */
const PinScreen: React.FC<Props> = () => {
  const onboardingAbortAlert = useOnboardingAbortAlert();
  const assistanceToolConfig = useSelector(assistanceToolConfigSelector);
  const dispatch = useDispatch();

  const assistanceTool = React.useMemo(
    () => assistanceToolRemoteConfig(assistanceToolConfig),
    [assistanceToolConfig]
  );

  const handleGoBack = () => {
    onboardingAbortAlert.showAlert();
  };

  const handleSubmit = React.useCallback(
    (pin: PinString) => {
      void safeSetPin(pin)
        .fold(
          error => {
            handleSendAssistanceLog(assistanceTool, `setPin error ${error}`);

            // TODO: Here we should show an error to the
            // user probably.
          },
          () => {
            handleSendAssistanceLog(assistanceTool, `createPinSuccess`);
            dispatch(createPinSuccess(pin));
          }
        )
        .run();
    },
    [assistanceTool, dispatch]
  );

  return (
    <BaseScreenComponent
      goBack={handleGoBack}
      contextualHelpMarkdown={contextualHelpMarkdown}
      faqCategories={["onboarding_pin", "unlock"]}
      headerTitle={I18n.t("onboarding.pin.headerTitle")}
    >
      <SafeAreaView>
        <PinCreationForm onSubmit={handleSubmit} />
      </SafeAreaView>
    </BaseScreenComponent>
  );
};

export default PinScreen;
