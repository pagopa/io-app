import { useRoute } from "@react-navigation/native";
import I18n from "i18next";
import { isFastLoginEnabledSelector } from "../../authentication/fastLogin/store/selectors";
import { completeOnboarding } from "../store/actions";
import { useIODispatch, useIOSelector } from "../../../store/hooks";
import { loggedInIdpSelector } from "../../authentication/common/store/selectors";
import { getFlowType } from "../../../utils/analytics";
import { useOnFirstRender } from "../../../utils/hooks/useOnFirstRender";
import { trackThankYouPageScreen } from "../../settings/common/analytics";
import { OperationResultScreenContent } from "../../../components/screens/OperationResultScreenContent";
import { trackLoginEnded } from "../../authentication/common/analytics";

const OnboardingCompletedScreen = () => {
  const dispatch = useIODispatch();

  const isFastLoginEnabled = useIOSelector(isFastLoginEnabledSelector);
  const idp = useIOSelector(loggedInIdpSelector);

  const idpName = idp?.name ?? "";
  const route = useRoute();

  useOnFirstRender(() => {
    trackThankYouPageScreen();
  });

  const handleContinue = () => {
    trackLoginEnded(
      isFastLoginEnabled,
      idpName,
      getFlowType(false, true),
      route.name
    );
    dispatch(completeOnboarding());
  };

  return (
    <OperationResultScreenContent
      pictogram="success"
      title={I18n.t("onboarding.thankYouPage.title")}
      action={{
        label: I18n.t("global.buttons.close"),
        accessibilityLabel: I18n.t("global.buttons.close"),
        onPress: handleContinue
      }}
    />
  );
};

export default OnboardingCompletedScreen;
