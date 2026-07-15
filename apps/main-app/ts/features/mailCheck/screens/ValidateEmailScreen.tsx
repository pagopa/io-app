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
  trackEmailNotAlreadyConfirmed,
  trackSendValidationEmail
} from "../analytics";

export type EmailNotVerifiedScreenParamList = {
  email: string;
};

const ValidateEmailScreen = () => {
  const dispatch = useIODispatch();
  const navigation = useIONavigation();
  const { email } =
    useRoute<
      Route<"CHECK_EMAIL_NOT_VERIFIED", EmailNotVerifiedScreenParamList>
    >().params;
  const isFirstOnboarding = useIOSelector(isProfileFirstOnBoardingSelector);
  const flow = getFlowType(true, isFirstOnboarding);
  const navigateToInsertEmailScreen = useCallback(() => {
    navigation.navigate(ROUTES.ONBOARDING, {
      screen: ROUTES.ONBOARDING_INSERT_EMAIL_SCREEN,
      params: {
        isOnboarding: true
      }
    });
  }, [navigation]);

  const contextualHelpMarkdown: ContextualHelpPropsMarkdown = {
    title: "email.cduScreens.validateMail.title",
    body: "email.cduScreens.validateMail.help.body"
  };

  useOnFirstRender(() => {
    trackEmailNotAlreadyConfirmed(flow);
  });

  const confirmButtonOnPress = useCallback(() => {
    // We dispatch this action to show the InsertEmailScreen with
    // the validation modal already opened.
    trackSendValidationEmail(flow);
    dispatch(acknowledgeOnEmailValidation(O.some(false)));
    navigateToInsertEmailScreen();
  }, [dispatch, flow, navigateToInsertEmailScreen]);

  const modifyEmailButtonOnPress = useCallback(() => {
    dispatch(acknowledgeOnEmailValidation(O.none));
    navigateToInsertEmailScreen();
  }, [dispatch, navigateToInsertEmailScreen]);

  useHeaderSecondLevel({
    title: "",
    supportRequest: true,
    contextualHelpMarkdown,
    canGoBack: false
  });

  return (
    <OperationResultScreenContent
      action={{
        label: I18n.t("email.cduScreens.validateMail.validateButton"),
        accessibilityLabel: I18n.t(
          "email.cduScreens.validateMail.validateButton"
        ),
        onPress: confirmButtonOnPress
      }}
      isHeaderVisible={true}
      pictogram="attention"
      secondaryAction={{
        label: I18n.t("email.cduScreens.validateMail.editButton"),
        accessibilityLabel: I18n.t("email.cduScreens.validateMail.editButton"),
        onPress: modifyEmailButtonOnPress
      }}
      subtitle={I18n.t("email.cduScreens.validateMail.subtitle", { email })}
      title={I18n.t("email.cduScreens.validateMail.title")}
    />
  );
};
export default ValidateEmailScreen;
