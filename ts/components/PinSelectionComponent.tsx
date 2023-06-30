import * as React from "react";
import { useContext } from "react";
import { KeyboardAvoidingView, SafeAreaView } from "react-native";
import I18n from "../i18n";
import {
  AppParamsList,
  IOStackNavigationRouteProps
} from "../navigation/params/AppParamsList";
import { createPinSuccess } from "../store/actions/pinset";
import { useIODispatch, useIOSelector } from "../store/hooks";
import { assistanceToolConfigSelector } from "../store/reducers/backendStatus";
import { PinString } from "../types/PinString";
import { useOnboardingAbortAlert } from "../utils/hooks/useOnboardingAbortAlert";
import { setPin } from "../utils/keychain";
import {
  assistanceToolRemoteConfig,
  handleSendAssistanceLog
} from "../utils/supportAssistance";
import { PinCreationForm } from "./PinCreationForm";
import BaseScreenComponent, {
  ContextualHelpPropsMarkdown
} from "./screens/BaseScreenComponent";
import { AlertModal } from "./ui/AlertModal";
import { LightModalContext } from "./ui/LightModal";

type Props = Pick<IOStackNavigationRouteProps<AppParamsList>, "navigation"> & {
  isOnboarding: boolean;
};

const contextualHelpMarkdown: ContextualHelpPropsMarkdown = {
  title: "onboarding.unlockCode.contextualHelpTitle",
  body: "onboarding.unlockCode.contextualHelpContent"
};

const PinSelectionComponent = ({ navigation, isOnboarding }: Props) => {
  const onboardingAbortAlert = useOnboardingAbortAlert();
  const { showModal } = useContext(LightModalContext);
  const assistanceToolConfig = useIOSelector(assistanceToolConfigSelector);
  const dispatch = useIODispatch();

  const assistanceTool = React.useMemo(
    () => assistanceToolRemoteConfig(assistanceToolConfig),
    [assistanceToolConfig]
  );

  const handleGoBack = React.useCallback(
    () =>
      isOnboarding ? onboardingAbortAlert.showAlert() : navigation.goBack(),
    [navigation, isOnboarding, onboardingAbortAlert]
  );

  const showRestartModal = React.useCallback(() => {
    showModal(
      <AlertModal
        message={I18n.t("profile.main.pagoPaEnvironment.alertMessage")}
      />
    );
  }, [showModal]);

  const handleSubmit = React.useCallback(
    (pin: PinString) => {
      setPin(pin)
        .then(() => {
          handleSendAssistanceLog(assistanceTool, `createPinSuccess`);
          dispatch(createPinSuccess(pin));

          if (!isOnboarding) {
            // We need to ask the user to restart the app
            showRestartModal();
            navigation.goBack();
          }
        })
        .catch(() => {
          // Here we are not logging the error because it could
          // cointain sensitive informations.
          handleSendAssistanceLog(assistanceTool, `setPin error`);

          // TODO: Here we should show an error to the
          // end user probably.
        });
    },
    [assistanceTool, dispatch, navigation, showRestartModal, isOnboarding]
  );

  return (
    <KeyboardAvoidingView
      keyboardVerticalOffset={0}
      behavior="padding"
      style={{ flex: 1 }}
      enabled
    >
      <BaseScreenComponent
        goBack={handleGoBack}
        contextualHelpMarkdown={contextualHelpMarkdown}
        faqCategories={["onboarding_pin", "unlock"]}
        headerTitle={I18n.t("onboarding.pin.headerTitle")}
      >
        <SafeAreaView style={{ flex: 1 }}>
          <PinCreationForm onSubmit={handleSubmit} />
        </SafeAreaView>
      </BaseScreenComponent>
    </KeyboardAvoidingView>
  );
};

export default PinSelectionComponent;
