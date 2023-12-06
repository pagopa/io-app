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
import { Link } from "../../../components/core/typography/Link";
import BaseScreenComponent from "../../../components/screens/BaseScreenComponent";
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

export type Props = {
  email: string;
};

const ValidateEmailScreen = (props: Props) => {
  const dispatch = useIODispatch();

  const navigateToInsertEmailScreen = () => {
    NavigationService.navigate(ROUTES.PROFILE_NAVIGATOR, {
      screen: ROUTES.INSERT_EMAIL_SCREEN
    });
  };

  const confirmButtonOnPress = React.useCallback(() => {
    // We dispatch this action to show the InsertEmailScreen with
    // the validation modal already opened.
    dispatch(acknowledgeOnEmailValidation(O.some(false)));
    navigateToInsertEmailScreen();
  }, [dispatch]);

  const modifyEmailButtonOnPress = React.useCallback(() => {
    dispatch(acknowledgeOnEmailValidation(O.none));
    navigateToInsertEmailScreen();
  }, [dispatch]);

  const continueButtonProps = {
    onPress: confirmButtonOnPress,
    title: I18n.t("email.cduScreens.validateMail.validateButton"),
    block: true
  };

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
          <Body weight="SemiBold">{props.email}</Body>
          <VSpacer size={16} />
          <Link onPress={modifyEmailButtonOnPress}>
            {I18n.t("email.cduScreens.validateMail.editButton")}
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
