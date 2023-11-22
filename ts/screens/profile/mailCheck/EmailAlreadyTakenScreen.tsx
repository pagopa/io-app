import * as React from "react";
import { View, SafeAreaView, StyleSheet } from "react-native";
import { Pictogram, VSpacer } from "@pagopa/io-app-design-system";
import * as O from "fp-ts/lib/Option";
import { useNavigation } from "@react-navigation/native";
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
import { useIOSelector } from "../../../store/hooks";
import { usePrevious } from "../../../utils/hooks/usePrevious";
import { emailValidationSelector } from "../../../store/reducers/emailValidation";

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

const confirmButtonOnPress = () => {
  NavigationService.navigate(ROUTES.PROFILE_NAVIGATOR, {
    screen: ROUTES.READ_EMAIL_SCREEN
  });
};

const EmailAlreadyTakenScreen = (props: Props) => {
  const { email } = props.route.params;

  const navigation = useNavigation();

  const acknowledgeOnEmailValidated = useIOSelector(
    emailValidationSelector
  ).acknowledgeOnEmailValidated;
  const previousAcknowledgeOnEmailValidated = usePrevious(
    acknowledgeOnEmailValidated
  );

  // If the user has acknowledged the email validation, go back to the previous screen.
  // The acknowledgeOnEmailValidated is set to NONE when the user presses the "Continue" button.
  // The previousAcknowledgeOnEmailValidated is set to SOME(false) when the user see the success screen.
  React.useEffect(() => {
    if (
      previousAcknowledgeOnEmailValidated &&
      O.isSome(previousAcknowledgeOnEmailValidated) &&
      O.isNone(acknowledgeOnEmailValidated)
    ) {
      navigation.goBack();
    }
  }, [
    acknowledgeOnEmailValidated,
    navigation,
    previousAcknowledgeOnEmailValidated
  ]);

  const continueButtonProps = {
    onPress: confirmButtonOnPress,
    title: I18n.t("email.cduModal.editMail.editButton"),
    block: true
  };

  return (
    <BaseScreenComponent
      goBack={false}
      accessibilityEvents={{ avoidNavigationEventsUsage: true }}
      contextualHelpMarkdown={{
        title: "email.validate.title",
        body: "email.validate.help"
      }}
      headerTitle={I18n.t("email.newinsert.header")}
    >
      <SafeAreaView style={IOStyles.flex}>
        <View style={styles.mainContainer}>
          <Pictogram name={"unrecognized"} size={120} />
          <VSpacer size={16} />
          <H3 style={styles.title}>
            {I18n.t("email.cduModal.editMail.title")}
          </H3>
          <VSpacer size={16} />
          <Body style={{ textAlign: "center" }}>
            <Body style={{ textAlign: "center" }}>
              {I18n.t("email.cduModal.editMail.subtitleStart")}
            </Body>
            <Body style={{ textAlign: "center" }} weight="SemiBold">
              {" "}
              {" " + email + " "}
            </Body>
            <Body style={{ textAlign: "center" }}>
              {I18n.t("email.cduModal.editMail.subtitleEnd")}
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
