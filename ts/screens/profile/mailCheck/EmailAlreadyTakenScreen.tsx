import { Route, useRoute } from "@react-navigation/native";
import * as O from "fp-ts/lib/Option";
import React, { useCallback, useMemo } from "react";
import { BodyProps } from "@pagopa/io-app-design-system";
import { ContextualHelpPropsMarkdown } from "../../../components/screens/BaseScreenComponent";
import I18n from "../../../i18n";
import { useIONavigation } from "../../../navigation/params/AppParamsList";
import ROUTES from "../../../navigation/routes";
import { acknowledgeOnEmailValidation } from "../../../store/actions/profile";
import { useIODispatch, useIOSelector } from "../../../store/hooks";
import { isProfileFirstOnBoardingSelector } from "../../../store/reducers/profile";
import { getFlowType } from "../../../utils/analytics";
import { useOnFirstRender } from "../../../utils/hooks/useOnFirstRender";
import {
  trackEmailAlreadyTaken,
  trackEmailDuplicateEditingConfirm
} from "../../analytics/emailAnalytics";

import { OperationResultScreenContent } from "../../../components/screens/OperationResultScreenContent";
import { useHeaderSecondLevel } from "../../../hooks/useHeaderSecondLevel";

export type OnboardingServicesPreferenceScreenNavigationParams = {
  isFirstOnboarding: boolean;
};

export type EmailAlreadyUsedScreenParamList = {
  email: string;
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

  const bodyPropsArray: Array<BodyProps> = useMemo(
    () => [
      {
        text: I18n.t("email.cduScreens.emailAlreadyTaken.subtitleStart"),
        style: {
          textAlign: "center"
        }
      },
      {
        text: <> {email} </>,
        style: {
          textAlign: "center"
        },
        weight: "Semibold"
      },
      {
        text: I18n.t("email.cduScreens.emailAlreadyTaken.subtitleEnd"),
        style: {
          textAlign: "center"
        }
      }
    ],
    [email]
  );

  useHeaderSecondLevel({
    title: "",
    supportRequest: true,
    canGoBack: false,
    contextualHelpMarkdown
  });

  return (
    <OperationResultScreenContent
      pictogram="accessDenied"
      title={I18n.t("email.cduScreens.emailAlreadyTaken.title")}
      subtitle={bodyPropsArray}
      action={{
        label: I18n.t("email.cduScreens.emailAlreadyTaken.editButton"),
        accessibilityLabel: I18n.t(
          "email.cduScreens.emailAlreadyTaken.editButton"
        ),
        onPress: confirmButtonOnPress
      }}
      isHeaderVisible={true}
    />
  );
};
export default EmailAlreadyTakenScreen;
