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
import { Link } from "../../../components/core/typography/Link";
import BaseScreenComponent from "../../../components/screens/BaseScreenComponent";
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

export type Props = {
  email: string;
};

const confirmButtonOnPress = () => {
  NavigationService.navigate(ROUTES.PROFILE_NAVIGATOR, {
    screen: ROUTES.READ_EMAIL_SCREEN
  });
};

const modifyEmailButtonOnPress = () => {
  NavigationService.navigate(ROUTES.PROFILE_NAVIGATOR, {
    screen: ROUTES.READ_EMAIL_SCREEN
  });
};

const ValidateEmailScreen = (props: Props) => {
  const continueButtonProps = {
    onPress: confirmButtonOnPress,
    title: I18n.t("email.cduModal.validateMail.validateButton"),
    block: true
  };

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
          <Pictogram name={"puzzle"} size={120} />
          <VSpacer size={16} />
          <H3 style={styles.title}>
            {I18n.t("email.cduModal.validateMail.title")}
          </H3>
          <VSpacer size={16} />
          <Body style={{ textAlign: "center" }}>
            {I18n.t("email.cduModal.validateMail.subtitle")}
          </Body>
          <Body weight="SemiBold">{props.email}</Body>
          <VSpacer size={16} />
          <Link onPress={modifyEmailButtonOnPress}>
            {I18n.t("email.cduModal.validateMail.editButton")}
          </Link>
        </View>
        <FooterWithButtons
          type={"SingleButton"}
          leftButton={continueButtonProps}
        />
      </SafeAreaView>
    </BaseScreenComponent>
  );
};
export default ValidateEmailScreen;
