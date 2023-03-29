/**
 * A screen to display the email address used by IO
 * The _isFromProfileSection_ navigation parameter let the screen being adapted
 * if:
 * - it is displayed during the user onboarding
 * - it is displayed after the onboarding (navigation from the profile section)
 */
import * as pot from "@pagopa/ts-commons/lib/pot";
import { StackActions } from "@react-navigation/native";
import * as O from "fp-ts/lib/Option";
import { Text as NBText } from "native-base";
import * as React from "react";
import { View, Alert, Platform, SafeAreaView, StyleSheet } from "react-native";
import { connect } from "react-redux";
import { H3 } from "../../components/core/typography/H3";
import { withLoadingSpinner } from "../../components/helpers/withLoadingSpinner";
import { withValidatedEmail } from "../../components/helpers/withValidatedEmail";
import { ContextualHelpPropsMarkdown } from "../../components/screens/BaseScreenComponent";
import ScreenContent from "../../components/screens/ScreenContent";
import TopScreenComponent from "../../components/screens/TopScreenComponent";
import SectionStatusComponent from "../../components/SectionStatus";
import {
  SingleButton,
  TwoButtonsInlineHalf
} from "../../components/ui/BlockButtons";
import FooterWithButtons from "../../components/ui/FooterWithButtons";
import IconFont from "../../components/ui/IconFont";
import I18n from "../../i18n";
import { IOStackNavigationProp } from "../../navigation/params/AppParamsList";
import { OnboardingParamsList } from "../../navigation/params/OnboardingParamsList";
import {
  navigateBack,
  navigateToEmailInsertScreen
} from "../../store/actions/navigation";
import {
  abortOnboarding,
  emailAcknowledged
} from "../../store/actions/onboarding";
import { Dispatch, ReduxProps } from "../../store/actions/types";
import {
  profileEmailSelector,
  profileSelector
} from "../../store/reducers/profile";
import { GlobalState } from "../../store/reducers/types";
import { userMetadataSelector } from "../../store/reducers/userMetadata";
import customVariables from "../../theme/variables";
import { isOnboardingCompleted } from "../../utils/navigation";

type Props = ReduxProps &
  ReturnType<typeof mapStateToProps> &
  ReturnType<typeof mapDispatchToProps> & {
    navigation: IOStackNavigationProp<
      OnboardingParamsList,
      "READ_EMAIL_SCREEN"
    >;
  };

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

export class EmailReadScreen extends React.PureComponent<Props> {
  constructor(props: Props) {
    super(props);
    this.handleGoBack = this.handleGoBack.bind(this);
  }

  get isFromProfileSection() {
    return isOnboardingCompleted();
  }

  private handleGoBack() {
    if (this.isFromProfileSection) {
      this.props.navigateBack();
    } else {
      Alert.alert(
        I18n.t("onboarding.alert.title"),
        I18n.t("onboarding.alert.description"),
        [
          {
            text: I18n.t("global.buttons.cancel"),
            style: "cancel"
          },
          {
            text: I18n.t("global.buttons.exit"),
            style: "default",
            onPress: this.props.abortOnboarding
          }
        ]
      );
    }
  }

  public render() {
    const { isFromProfileSection } = this;
    const onboardingCompleted = isOnboardingCompleted();
    const footerProps1: SingleButton = {
      type: "SingleButton",
      leftButton: {
        bordered: true,
        title: I18n.t("email.edit.cta"),
        onPress: this.props.navigateToEmailInsertScreen
      }
    };
    const footerProps2: TwoButtonsInlineHalf = {
      type: "TwoButtonsInlineHalf",
      leftButton: {
        block: true,
        bordered: true,
        title: I18n.t("email.edit.cta"),
        onPress: () => {
          if (!onboardingCompleted) {
            this.props.navigation.dispatch(StackActions.popToTop());
          }
          this.props.navigateToEmailInsertScreen();
        }
      },
      rightButton: {
        block: true,
        primary: true,
        title: I18n.t("global.buttons.continue"),
        onPress: this.props.acknowledgeEmail
      }
    };

    return (
      <SafeAreaView style={styles.flex}>
        <TopScreenComponent
          goBack={this.handleGoBack}
          headerTitle={I18n.t("profile.data.list.email")}
          contextualHelpMarkdown={contextualHelpMarkdown}
        >
          <ScreenContent
            title={I18n.t("email.read.title")}
            subtitle={
              isFromProfileSection ? undefined : I18n.t("email.insert.subtitle")
            }
          >
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
                {O.isSome(this.props.optionEmail) && (
                  <H3>{this.props.optionEmail.value}</H3>
                )}
              </View>
              <View style={styles.spacerLarge} />
              <NBText>
                {isFromProfileSection
                  ? `${I18n.t("email.read.details")}`
                  : I18n.t("email.read.info")}
              </NBText>
            </View>
          </ScreenContent>
          <SectionStatusComponent sectionKey={"email_validation"} />
          <FooterWithButtons
            {...(isFromProfileSection ? footerProps1 : footerProps2)}
          />
        </TopScreenComponent>
      </SafeAreaView>
    );
  }
}

const mapStateToProps = (state: GlobalState) => {
  const onboardingCompleted = isOnboardingCompleted();
  const potUserMetadata = userMetadataSelector(state);

  // If the screen is displayed as last item of the onboarding ,show loading spinner
  // until the user metadata load is completed
  const isLoading = !onboardingCompleted && pot.isLoading(potUserMetadata);
  return {
    optionProfile: pot.toOption(profileSelector(state)),
    optionEmail: profileEmailSelector(state),
    isLoading
  };
};

const mapDispatchToProps = (dispatch: Dispatch) => ({
  acknowledgeEmail: () => dispatch(emailAcknowledged()),
  abortOnboarding: () => dispatch(abortOnboarding()),
  navigateToEmailInsertScreen: () => {
    navigateToEmailInsertScreen();
  },
  navigateBack: () => navigateBack()
});

export default withValidatedEmail(
  connect(
    mapStateToProps,
    mapDispatchToProps
  )(withLoadingSpinner(EmailReadScreen))
);
