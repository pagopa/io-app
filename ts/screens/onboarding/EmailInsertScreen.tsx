/**
 * A screen where user after login (with CIE) can set email address if it is
 * not present in the profile.
 */

import { none, Option, some } from "fp-ts/lib/Option";
import * as pot from "italia-ts-commons/lib/pot";
import { EmailString } from "italia-ts-commons/lib/strings";
import { Content, Form, Text, View } from "native-base";
import * as React from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  StyleSheet
} from "react-native";
import { NavigationScreenProps } from "react-navigation";
import { connect } from "react-redux";
import { withLoadingSpinner } from "../../components/helpers/withLoadingSpinner";
import { LabelledItem } from "../../components/LabelledItem";
import BaseScreenComponent from "../../components/screens/BaseScreenComponent";
import FooterWithButtons from "../../components/ui/FooterWithButtons";
import H4 from "../../components/ui/H4";
import Markdown from "../../components/ui/Markdown";
import I18n from "../../i18n";
import { navigateToEmailValidateScreen } from "../../store/actions/navigation";
import { abortOnboarding, emailInsert } from "../../store/actions/onboarding";
import { profileUpsert } from "../../store/actions/profile";
import { Dispatch, ReduxProps } from "../../store/actions/types";
import { isOnboardingCompletedSelector } from "../../store/reducers/navigationHistory";
import {
  emailProfileSelector,
  isProfileEmailValidatedSelector,
  profileSelector
} from "../../store/reducers/profile";
import { GlobalState } from "../../store/reducers/types";
import customVariables from "../../theme/variables";
import { showToast } from "../../utils/showToast";

type Props = ReduxProps &
  ReturnType<typeof mapDispatchToProps> &
  ReturnType<typeof mapStateToProps> &
  NavigationScreenProps;

const styles = StyleSheet.create({
  flex: {
    flex: 1
  },
  horizontalPadding: {
    paddingHorizontal: customVariables.contentPadding
  },
  boldH4: {
    fontWeight: customVariables.textBoldWeight,
    paddingTop: customVariables.spacerLargeHeight
  },
  icon: {
    marginTop: Platform.OS === "android" ? 4 : 6 // adjust icon position to align it with baseline of email text}
  },
  emailInput: {
    fontWeight: customVariables.h1FontWeight,
    color: customVariables.h1Color,
    fontSize: 18
  },
  darkestGray: {
    color: customVariables.brandDarkestGray
  }
});

const EMPTY_EMAIL = "";

const contextualHelp = {
  title: I18n.t("email.insert.help.title"),
  body: () => <Markdown>{I18n.t("email.insert.help.content")}</Markdown>
};

type State = Readonly<{
  email: Option<string>;
}>;

/**
 * A screen to allow user to insert an email address.
 */
class EmailInsertScreen extends React.PureComponent<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { email: this.props.optionEmail };
  }

  private continueOnPress = () => {
    this.state.email.map(e => {
      this.props.dispatchEmailUpdate(e as EmailString);
    });
  };

  /**
   * Footer
   *
   * TODO1: add navigation to the dedicated modal
   *          https://www.pivotaltracker.com/story/show/169545858
   * TODO:2 save the inserted new email
   *          https://www.pivotaltracker.com/n/projects/2048617/stories/169264055
   */
  private renderFooterButtons = () => {
    const continueButtonProps = {
      disabled: this.isValidEmail() !== true && !this.props.isLoading,
      onPress: this.continueOnPress,
      title: I18n.t("global.buttons.continue"),
      block: true,
      primary: this.isValidEmail()
    };

    return (
      <FooterWithButtons type="SingleButton" leftButton={continueButtonProps} />
    );
  };

  /** validate email returning three possible values:
   * - _true_,      if email is valid.
   * - _false_,     if email has been already changed from the user and it is not
   * valid.
   * - _undefined_, if email field is empty. This state is consumed by
   * LabelledItem Component and it used for style pourposes ONLY.
   */
  private isValidEmail = () => {
    return this.state.email
      .map(value => {
        if (EMPTY_EMAIL === value) {
          return undefined;
        }
        return EmailString.decode(value).isRight();
      })
      .toUndefined();
  };

  private handleOnChangeEmailText = (value: string) => {
    this.setState({
      email: value !== EMPTY_EMAIL ? some(value.toLowerCase().trim()) : none
    });
  };

  private handleGoBack = () => {
    if (this.isFromProfileSection) {
      this.props.navigation.goBack();
    } else {
      // we are in onboarding phase
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
            onPress: this.props.dispatchAbortOnboarding
          }
        ]
      );
    }
  };

  get isFromProfileSection() {
    return this.props.isOnboardingCompleted;
  }

  public componentDidMount() {
    if (this.isFromProfileSection) {
      this.setState({ email: some(EMPTY_EMAIL) });
    }
  }

  public componentDidUpdate(prevProps: Props) {
    // if we were updating the profile
    if (pot.isUpdating(prevProps.profile)) {
      // and we got an error
      if (pot.isError(this.props.profile)) {
        // display a toast with error
        showToast(I18n.t("email.edit.upsert_ko"), "danger");
      } else if (pot.isSome(this.props.profile)) {
        // display a success toast
        showToast(I18n.t("email.edit.upsert_ok"), "success");
        // go back
        if (this.props.isOnboardingCompleted) {
          this.props.navigation.goBack();
        } else {
          this.props.dispatchNavigateToEmailValidateScreen();
        }
      }
    }
  }

  public render() {
    const { isFromProfileSection } = this;
    return (
      <BaseScreenComponent
        goBack={this.handleGoBack}
        headerTitle={
          isFromProfileSection
            ? I18n.t("profile.preferences.list.email")
            : I18n.t("email.insert.header")
        }
        contextualHelp={contextualHelp}
      >
        <View style={styles.flex}>
          <Content noPadded={true} style={styles.flex} scrollEnabled={false}>
            <H4 style={[styles.boldH4, styles.horizontalPadding]}>
              {isFromProfileSection
                ? I18n.t("email.edit.title")
                : I18n.t("email.insert.title")}
            </H4>
            <View spacer={true} />
            <View style={styles.horizontalPadding}>
              <Text>
                {isFromProfileSection
                  ? this.props.isEmailValidated
                    ? I18n.t("email.edit.validated")
                    : I18n.t("email.edit.subtitle")
                  : I18n.t("email.insert.subtitle")}
                {isFromProfileSection && (
                  <Text style={styles.darkestGray}>
                    {` ${this.props.optionEmail.getOrElse("")}`}
                  </Text>
                )}
              </Text>
            </View>
            <View spacer={true} />
            <View style={styles.horizontalPadding}>
              <Form>
                <LabelledItem
                  type={"text"}
                  label={
                    isFromProfileSection
                      ? I18n.t("email.edit.label")
                      : I18n.t("email.insert.label")
                  }
                  icon="io-envelope"
                  isValid={this.isValidEmail()}
                  inputProps={{
                    autoCapitalize: "none",
                    keyboardType: "email-address",
                    value: this.state.email.getOrElse(EMPTY_EMAIL),
                    onChangeText: this.handleOnChangeEmailText,
                    style: styles.emailInput
                  }}
                  iconStyle={styles.icon}
                />
              </Form>
            </View>
          </Content>

          <KeyboardAvoidingView
            behavior="padding"
            keyboardVerticalOffset={Platform.select({
              ios: 100,
              android: 80
            })}
          >
            {this.renderFooterButtons()}
          </KeyboardAvoidingView>
        </View>
      </BaseScreenComponent>
    );
  }
}

function mapStateToProps(state: GlobalState) {
  const profile = profileSelector(state);
  return {
    profile,
    optionEmail: emailProfileSelector(state),
    isEmailValidated: isProfileEmailValidatedSelector(state),
    isLoading: pot.isUpdating(profile),
    isOnboardingCompleted: isOnboardingCompletedSelector(state)
  };
}

const mapDispatchToProps = (dispatch: Dispatch) => ({
  dispatchEmailUpdate: (email: EmailString) =>
    dispatch(
      profileUpsert.request({
        email
      })
    ),
  dispatchEmailInsert: () => dispatch(emailInsert()),
  dispatchAbortOnboarding: () => dispatch(abortOnboarding()),
  dispatchNavigateToEmailValidateScreen: () =>
    dispatch(navigateToEmailValidateScreen())
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(withLoadingSpinner(EmailInsertScreen));
