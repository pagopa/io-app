/**
 * A screen to display the email address used by IO
 * The _isFromProfileSection_ navigation parameter let the screen being adapted
 * if:
 * - it is displayed during the user onboarding
 * - it is displayed after the onboarding (navigation from the profile section)
 */
import * as O from "fp-ts/lib/Option";
import { Text as NBText, View } from "native-base";
import * as React from "react";
import { Platform, SafeAreaView, StyleSheet } from "react-native";
import { H3 } from "../../components/core/typography/H3";
import { withValidatedEmail } from "../../components/helpers/withValidatedEmail";
import { ContextualHelpPropsMarkdown } from "../../components/screens/BaseScreenComponent";
import ScreenContent from "../../components/screens/ScreenContent";
import TopScreenComponent from "../../components/screens/TopScreenComponent";
import SectionStatusComponent from "../../components/SectionStatus";
import { SingleButton } from "../../components/ui/BlockButtons";
import FooterWithButtons from "../../components/ui/FooterWithButtons";
import IconFont from "../../components/ui/IconFont";
import I18n from "../../i18n";
import { IOStackNavigationRouteProps } from "../../navigation/params/AppParamsList";
import { OnboardingParamsList } from "../../navigation/params/OnboardingParamsList";
import { navigateToEmailInsertScreen } from "../../store/actions/navigation";
import { ReduxProps } from "../../store/actions/types";
import { useIOSelector } from "../../store/hooks";
import { profileEmailSelector } from "../../store/reducers/profile";
import customVariables from "../../theme/variables";

type Props = ReduxProps &
  IOStackNavigationRouteProps<OnboardingParamsList, "READ_EMAIL_SCREEN">;

const styles = StyleSheet.create({
  flex: {
    flex: 1
  },
  emailWithIcon: {
    flexDirection: "row",
    justifyContent: "flex-start",
    alignItems: "center"
  },
  content: {
    paddingHorizontal: customVariables.contentPadding,
    backgroundColor: customVariables.contentBackground,
    flex: 1
  },
  spacerSmall: { height: 12 },
  spacerLarge: { height: 24 },
  icon: {
    marginTop: Platform.OS === "android" ? 3 : 0, // correct icon position to align it with baseline of email text
    marginRight: 8
  }
});

const contextualHelpMarkdown: ContextualHelpPropsMarkdown = {
  title: "profile.data.email.contextualHelpTitle",
  body: "profile.data.email.contextualHelpContent"
};

const EmailReadScreen = (props: Props) => {
  const optionEmail = useIOSelector(profileEmailSelector);

  const handleGoBack = () => {
    props.navigation.goBack();
  };

  const footerProps: SingleButton = {
    type: "SingleButton",
    leftButton: {
      bordered: true,
      title: I18n.t("email.edit.cta"),
      // TODO replace with new insert screen
      onPress: navigateToEmailInsertScreen
    }
  };

  return (
    <SafeAreaView style={styles.flex}>
      <TopScreenComponent
        goBack={handleGoBack}
        headerTitle={I18n.t("profile.data.list.email")}
        contextualHelpMarkdown={contextualHelpMarkdown}
      >
        <ScreenContent title={I18n.t("email.read.title")}>
          <View style={styles.content}>
            <NBText>{I18n.t("email.insert.label")}</NBText>
            <View style={styles.spacerSmall} />
            <View style={styles.emailWithIcon}>
              <IconFont
                name="io-envelope"
                accessible={true}
                accessibilityLabel={I18n.t("email.read.title")}
                size={24}
                style={styles.icon}
              />
              {O.isSome(optionEmail) && <H3>{optionEmail.value}</H3>}
            </View>
            <View style={styles.spacerLarge} />
            <NBText>{`${I18n.t("email.read.details")}`}</NBText>
          </View>
        </ScreenContent>
        <SectionStatusComponent sectionKey={"email_validation"} />
        <FooterWithButtons {...footerProps} />
      </TopScreenComponent>
    </SafeAreaView>
  );
};

export default withValidatedEmail(EmailReadScreen);
