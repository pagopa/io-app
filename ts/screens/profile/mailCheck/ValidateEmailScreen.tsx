import {
  FooterWithButtons,
  Pictogram,
  VSpacer
} from "@pagopa/io-app-design-system";
import { Route, useRoute } from "@react-navigation/native";
import * as O from "fp-ts/lib/Option";
import I18n from "i18n-js";
import * as React from "react";
import { useCallback } from "react";
import { SafeAreaView, StyleSheet, View } from "react-native";
import { Body } from "../../../components/core/typography/Body";
import { H3 } from "../../../components/core/typography/H3";
import { Link } from "../../../components/core/typography/Link";
import { IOStyles } from "../../../components/core/variables/IOStyles";
import BaseScreenComponent from "../../../components/screens/BaseScreenComponent";
import { useIONavigation } from "../../../navigation/params/AppParamsList";
import ROUTES from "../../../navigation/routes";
import { acknowledgeOnEmailValidation } from "../../../store/actions/profile";
import { useIODispatch, useIOSelector } from "../../../store/hooks";
import { isProfileFirstOnBoardingSelector } from "../../../store/reducers/profile";
import customVariables from "../../../theme/variables";
import { getFlowType } from "../../../utils/analytics";
import { useOnFirstRender } from "../../../utils/hooks/useOnFirstRender";
import {
  trackEmailNotAlreadyConfirmed,
  trackSendValidationEmail
} from "../../analytics/emailAnalytics";

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: customVariables.contentPaddingLarge
  },
  title: {
    textAlign: "center"
  }
});

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

  useOnFirstRender(() => {
    trackEmailNotAlreadyConfirmed(flow);
  });

  const confirmButtonOnPress = React.useCallback(() => {
    // We dispatch this action to show the InsertEmailScreen with
    // the validation modal already opened.
    trackSendValidationEmail(flow);
    dispatch(acknowledgeOnEmailValidation(O.some(false)));
    navigateToInsertEmailScreen();
  }, [dispatch, flow, navigateToInsertEmailScreen]);

  const modifyEmailButtonOnPress = React.useCallback(() => {
    dispatch(acknowledgeOnEmailValidation(O.none));
    navigateToInsertEmailScreen();
  }, [dispatch, navigateToInsertEmailScreen]);

  return (
    <BaseScreenComponent
      goBack={false}
      accessibilityEvents={{ avoidNavigationEventsUsage: true }}
      contextualHelpMarkdown={{
        title: "email.cduScreens.validateMail.title",
        body: "email.cduScreens.validateMail.help.body"
      }}
      headerTitle={I18n.t("email.cduScreens.validateMail.header.title")}
    >
      <SafeAreaView style={IOStyles.flex}>
        <View style={styles.mainContainer}>
          <Pictogram name={"puzzle"} size={120} />
          <VSpacer size={16} />
          <H3 style={styles.title}>
            {I18n.t("email.cduScreens.validateMail.title")}
          </H3>
          <VSpacer size={16} />
          <Body style={{ textAlign: "center" }}>
            {I18n.t("email.cduScreens.validateMail.subtitle")}
          </Body>
          <Body weight="SemiBold">{email}</Body>
          <VSpacer size={16} />
          <Link onPress={modifyEmailButtonOnPress}>
            {I18n.t("email.cduScreens.validateMail.editButton")}
          </Link>
        </View>
      </SafeAreaView>
      <FooterWithButtons
        type="SingleButton"
        primary={{
          type: "Solid",
          buttonProps: {
            onPress: confirmButtonOnPress,
            label: I18n.t("email.cduScreens.validateMail.validateButton"),
            accessibilityLabel: I18n.t(
              "email.cduScreens.validateMail.validateButton"
            )
          }
        }}
      />
    </BaseScreenComponent>
  );
};
export default ValidateEmailScreen;
