import * as React from "react";
import { View, SafeAreaView, StyleSheet } from "react-native";
import { Pictogram, VSpacer } from "@pagopa/io-app-design-system";
import * as O from "fp-ts/lib/Option";
import I18n from "../../../i18n";
import { Body } from "../../../components/core/typography/Body";
import { H3 } from "../../../components/core/typography/H3";
import { IOStyles } from "../../../components/core/variables/IOStyles";
import themeVariables from "../../../theme/variables";
import FooterWithButtons from "../../../components/ui/FooterWithButtons";
import BaseScreenComponent from "../../../components/screens/BaseScreenComponent";
import { CheckEmailParamsList } from "../../../navigation/params/CheckEmailParamsList";
import { IOStackNavigationRouteProps } from "../../../navigation/params/AppParamsList";
import NavigationService from "../../../navigation/NavigationService";
import ROUTES from "../../../navigation/routes";
import { useIODispatch } from "../../../store/hooks";
import { acknowledgeOnEmailValidation } from "../../../store/actions/profile";

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
type Props = IOStackNavigationRouteProps<
  CheckEmailParamsList,
  "CHECK_EMAIL_ALREADY_TAKEN"
>;

export type EmailAlreadyUsedScreenParamList = {
  email: string;
};

const navigateToInsertEmailScreen = () => {
  NavigationService.navigate(ROUTES.ONBOARDING, {
    screen: ROUTES.ONBOARDING_READ_EMAIL_SCREEN
  });
};

const EmailAlreadyTakenScreen = (props: Props) => {
  const { email } = props.route.params;

  const dispatch = useIODispatch();

  const confirmButtonOnPress = React.useCallback(() => {
    dispatch(acknowledgeOnEmailValidation(O.none));
    navigateToInsertEmailScreen();
  }, [dispatch]);

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
