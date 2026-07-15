import { useRoute } from "@react-navigation/native";
import I18n from "i18next";

import { OperationResultScreenContent } from "../../../components/screens/OperationResultScreenContent";
import { useIODispatch, useIOSelector } from "../../../store/hooks";
import { getFlowType } from "../../../utils/analytics";
import { useOnFirstRender } from "../../../utils/hooks/useOnFirstRender";
import { trackLoginEnded } from "../../authentication/common/analytics";
import { loggedInIdpSelector } from "../../authentication/common/store/selectors";
import { isFastLoginEnabledSelector } from "../../authentication/fastLogin/store/selectors";
import { trackThankYouPageScreen } from "../../settings/common/analytics";
import { completeOnboarding } from "../store/actions";

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
      action={{
        label: I18n.t("global.buttons.close"),
        accessibilityLabel: I18n.t("global.buttons.close"),
        onPress: handleContinue
      }}
      pictogram="success"
      title={I18n.t("onboarding.thankYouPage.title")}
    />
  );
};

export default OnboardingCompletedScreen;
