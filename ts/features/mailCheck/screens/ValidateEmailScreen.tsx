import { useMemo, useCallback } from "react";
import * as O from "fp-ts/lib/Option";
import { Route, useRoute } from "@react-navigation/native";
import { BodyProps } from "@pagopa/io-app-design-system";
import I18n from "i18next";
import { useIONavigation } from "../../../navigation/params/AppParamsList";
import ROUTES from "../../../navigation/routes";
import { acknowledgeOnEmailValidation } from "../../settings/common/store/actions";
import { useIODispatch, useIOSelector } from "../../../store/hooks";
import { useOnFirstRender } from "../../../utils/hooks/useOnFirstRender";
import {
  trackSendValidationEmail,
  trackEmailNotAlreadyConfirmed
} from "../analytics";
import { getFlowType } from "../../../utils/analytics";
import { isProfileFirstOnBoardingSelector } from "../../settings/common/store/selectors";
import { OperationResultScreenContent } from "../../../components/screens/OperationResultScreenContent";
import { useHeaderSecondLevel } from "../../../hooks/useHeaderSecondLevel";
import { ContextualHelpPropsMarkdown } from "../../../utils/help";

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

  const bodyPropsArray: Array<BodyProps> = useMemo(
    () => [
      {
        text: I18n.t("email.cduScreens.validateMail.subtitle"),
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
      }
    ],
    [email]
  );

  useHeaderSecondLevel({
    title: "",
    supportRequest: true,
    contextualHelpMarkdown,
    canGoBack: false
  });

  return (
    <OperationResultScreenContent
      pictogram="attention"
      title={I18n.t("email.cduScreens.validateMail.title")}
      subtitle={bodyPropsArray}
      action={{
        label: I18n.t("email.cduScreens.validateMail.validateButton"),
        accessibilityLabel: I18n.t(
          "email.cduScreens.validateMail.validateButton"
        ),
        onPress: confirmButtonOnPress
      }}
      secondaryAction={{
        label: I18n.t("email.cduScreens.validateMail.editButton"),
        accessibilityLabel: I18n.t("email.cduScreens.validateMail.editButton"),
        onPress: modifyEmailButtonOnPress
      }}
      isHeaderVisible={true}
    />
  );
};
export default ValidateEmailScreen;
