import {
  FooterWithButtons,
  Pictogram,
  VSpacer
} from "@pagopa/io-app-design-system";
import { Route, useRoute } from "@react-navigation/native";
import * as O from "fp-ts/lib/Option";
import React from "react";
import { SafeAreaView, StyleSheet, View } from "react-native";
import { Body } from "../../../components/core/typography/Body";
import { H3 } from "../../../components/core/typography/H3";
import { IOStyles } from "../../../components/core/variables/IOStyles";
import BaseScreenComponent from "../../../components/screens/BaseScreenComponent";
import I18n from "../../../i18n";
import { useIONavigation } from "../../../navigation/params/AppParamsList";
import ROUTES from "../../../navigation/routes";
import { acknowledgeOnEmailValidation } from "../../../store/actions/profile";
import { useIODispatch, useIOSelector } from "../../../store/hooks";
import { isProfileFirstOnBoardingSelector } from "../../../store/reducers/profile";
import customVariables from "../../../theme/variables";
import { getFlowType } from "../../../utils/analytics";
import { useOnFirstRender } from "../../../utils/hooks/useOnFirstRender";
import {
  trackEmailAlreadyTaken,
  trackEmailDuplicateEditingConfirm
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

export type OnboardingServicesPreferenceScreenNavigationParams = {
  isFirstOnboarding: boolean;
};

export type EmailAlreadyUsedScreenParamList = {
  email: string;
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
  const navigateToInsertEmailScreen = React.useCallback(() => {
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

  const confirmButtonOnPress = React.useCallback(() => {
    trackEmailDuplicateEditingConfirm(flow);
    dispatch(acknowledgeOnEmailValidation(O.none));
    navigateToInsertEmailScreen();
  }, [dispatch, flow, navigateToInsertEmailScreen]);

  return (
    <BaseScreenComponent
      goBack={false}
      accessibilityEvents={{ avoidNavigationEventsUsage: true }}
      contextualHelpMarkdown={{
        title: "email.cduScreens.emailAlreadyTaken.title",
        body: "email.cduScreens.emailAlreadyTaken.help.body"
      }}
      headerTitle={I18n.t("email.cduScreens.emailAlreadyTaken.header.title")}
    >
      <SafeAreaView style={IOStyles.flex}>
        <View style={styles.mainContainer}>
          <Pictogram name={"unrecognized"} size={120} />
          <VSpacer size={16} />
          <H3 style={styles.title}>
            {I18n.t("email.cduScreens.emailAlreadyTaken.title")}
          </H3>
          <VSpacer size={16} />
          <Body style={{ textAlign: "center" }}>
            <Body style={{ textAlign: "center" }}>
              {I18n.t("email.cduScreens.emailAlreadyTaken.subtitleStart")}
            </Body>
            <Body style={{ textAlign: "center" }} weight="SemiBold">
              {" "}
              {" " + email + " "}
            </Body>
            <Body style={{ textAlign: "center" }}>
              {I18n.t("email.cduScreens.emailAlreadyTaken.subtitleEnd")}
            </Body>
          </Body>
        </View>
      </SafeAreaView>
      <FooterWithButtons
        type="SingleButton"
        primary={{
          type: "Solid",
          buttonProps: {
            onPress: confirmButtonOnPress,
            label: I18n.t("email.cduScreens.emailAlreadyTaken.editButton"),
            accessibilityLabel: I18n.t(
              "email.cduScreens.emailAlreadyTaken.editButton"
            )
          }
        }}
      />
    </BaseScreenComponent>
  );
};
export default EmailAlreadyTakenScreen;
