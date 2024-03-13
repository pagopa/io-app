import * as React from "react";
import { View, SafeAreaView, StyleSheet } from "react-native";
import { Pictogram, VSpacer } from "@pagopa/io-app-design-system";
import * as O from "fp-ts/lib/Option";
import { Route, useRoute } from "@react-navigation/native";
import I18n from "../../../i18n";
import { Body } from "../../../components/core/typography/Body";
import { H3 } from "../../../components/core/typography/H3";
import { IOStyles } from "../../../components/core/variables/IOStyles";
import themeVariables from "../../../theme/variables";
import FooterWithButtons from "../../../components/ui/FooterWithButtons";
import BaseScreenComponent from "../../../components/screens/BaseScreenComponent";
import { useIONavigation } from "../../../navigation/params/AppParamsList";
import ROUTES from "../../../navigation/routes";
import { useIODispatch, useIOSelector } from "../../../store/hooks";
import { acknowledgeOnEmailValidation } from "../../../store/actions/profile";
import { useOnFirstRender } from "../../../utils/hooks/useOnFirstRender";
import {
  trackEmailAlreadyTaken,
  trackEmailDuplicateEditingConfirm
} from "../../analytics/emailAnalytics";
import { isProfileFirstOnBoardingSelector } from "../../../store/reducers/profile";
import { getFlowType } from "../../../utils/analytics";

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: themeVariables.contentPaddingLarge
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
      screen: ROUTES.ONBOARDING_READ_EMAIL_SCREEN,
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

  const continueButtonProps = {
    onPress: confirmButtonOnPress,
    title: I18n.t("email.cduScreens.emailAlreadyTaken.editButton"),
    block: true
  };

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
        <FooterWithButtons
          type={"SingleButton"}
          leftButton={continueButtonProps}
        />
      </SafeAreaView>
    </BaseScreenComponent>
  );
};
export default EmailAlreadyTakenScreen;
