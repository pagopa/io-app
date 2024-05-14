import { useRoute } from "@react-navigation/native";
import * as O from "fp-ts/lib/Option";
import React from "react";
import { useDispatch } from "react-redux";
import { isFastLoginEnabledSelector } from "../../features/fastLogin/store/selectors";
import I18n from "../../i18n";
import { completeOnboarding } from "../../store/actions/onboarding";
import { useIOSelector } from "../../store/hooks";
import { idpSelector } from "../../store/reducers/authentication";
import { getFlowType } from "../../utils/analytics";
import { useOnFirstRender } from "../../utils/hooks/useOnFirstRender";
import { trackThankYouPageScreen } from "../profile/analytics";
import { OperationResultScreenContent } from "../../components/screens/OperationResultScreenContent";
import { trackLoginEnded } from "../authentication/analytics";

const OnboardingCompletedScreen = () => {
  const dispatch = useDispatch();

  const isFastLoginEnabled = useIOSelector(isFastLoginEnabledSelector);
  const idpSelected = useIOSelector(idpSelector);

  const idp = O.isSome(idpSelected) ? idpSelected.value.name : "";
  const route = useRoute();

  useOnFirstRender(() => {
    trackThankYouPageScreen();
  });

  const handleContinue = () => {
    trackLoginEnded(
      isFastLoginEnabled,
      idp,
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
