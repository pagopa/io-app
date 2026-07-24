import { Route, useRoute } from "@react-navigation/native";
import * as O from "fp-ts/lib/Option";
import I18n from "i18next";
import { useCallback } from "react";

import { OperationResultScreenContent } from "../../../components/screens/OperationResultScreenContent";
import { useHeaderSecondLevel } from "../../../hooks/useHeaderSecondLevel";
import { useIONavigation } from "../../../navigation/params/AppParamsList";
import ROUTES from "../../../navigation/routes";
import { useIODispatch, useIOSelector } from "../../../store/hooks";
import { getFlowType } from "../../../utils/analytics";
import { ContextualHelpPropsMarkdown } from "../../../utils/contextualHelp";
import { useOnFirstRender } from "../../../utils/hooks/useOnFirstRender";
import { acknowledgeOnEmailValidation } from "../../settings/common/store/actions";
import { isProfileFirstOnBoardingSelector } from "../../settings/common/store/selectors";
import {
  trackEmailAlreadyTaken,
  trackEmailDuplicateEditingConfirm
} from "../analytics";

export type EmailAlreadyUsedScreenParamList = {
  email: string;
};

export type OnboardingServicesPreferenceScreenNavigationParams = {
  isFirstOnboarding: boolean;
};

const contextualHelpMarkdown: ContextualHelpPropsMarkdown = {
  title: "email.cduScreens.emailAlreadyTaken.title",
  body: "email.cduScreens.emailAlreadyTaken.help.body"
};

const EmailAlreadyTakenScreen = () => {
  const { email } =
    useRoute<
      Route<"CHECK_EMAIL_ALREADY_TAKEN", EmailAlreadyUsedScreenParamList>
    >().params;

  const dispatch = useIODispatch();
  const navigation = useIONavigation();
  const isFirstOnBoarding = useIOSelector(isProfileFirstOnBoardingSelector);
  const flow = getFlowType(true, isFirstOnBoarding);
  const navigateToInsertEmailScreen = useCallback(() => {
    navigation.navigate(ROUTES.ONBOARDING, {
      screen: ROUTES.ONBOARDING_INSERT_EMAIL_SCREEN,
      params: {
        isOnboarding: true
      }
    });
  }, [navigation]);

  useOnFirstRender(() => {
    trackEmailAlreadyTaken(flow);
  });

  const confirmButtonOnPress = useCallback(() => {
    trackEmailDuplicateEditingConfirm(flow);
    dispatch(acknowledgeOnEmailValidation(O.none));
    navigateToInsertEmailScreen();
  }, [dispatch, flow, navigateToInsertEmailScreen]);

  useHeaderSecondLevel({
    title: "",
    supportRequest: true,
    canGoBack: false,
    contextualHelpMarkdown
  });

  return (
    <OperationResultScreenContent
      action={{
        label: I18n.t("email.cduScreens.emailAlreadyTaken.editButton"),
        accessibilityLabel: I18n.t(
          "email.cduScreens.emailAlreadyTaken.editButton"
        ),
        onPress: confirmButtonOnPress
      }}
      isHeaderVisible={true}
      pictogram="accessDenied"
      subtitle={I18n.t("email.cduScreens.emailAlreadyTaken.subtitle", {
        email
      })}
      title={I18n.t("email.cduScreens.emailAlreadyTaken.title")}
    />
  );
};
export default EmailAlreadyTakenScreen;
