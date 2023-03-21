/**
 * A screen where user after login (with CIE) can set email address if it is
 * not present in the profile.
 */
import * as pot from "@pagopa/ts-commons/lib/pot";
import { EmailString } from "@pagopa/ts-commons/lib/strings";
import { StackActions } from "@react-navigation/native";
import * as E from "fp-ts/lib/Either";
import { pipe } from "fp-ts/lib/function";
import * as O from "fp-ts/lib/Option";
import { Content, Form } from "native-base";
import * as React from "react";
import {
  View,
  Alert,
  Keyboard,
  Platform,
  SafeAreaView,
  StyleSheet
} from "react-native";
import { connect } from "react-redux";
import { VSpacer } from "../../components/core/spacer/Spacer";
import { Body } from "../../components/core/typography/Body";
import { H1 } from "../../components/core/typography/H1";
import { IOStyles } from "../../components/core/variables/IOStyles";
import { withLoadingSpinner } from "../../components/helpers/withLoadingSpinner";
import { LabelledItem } from "../../components/LabelledItem";
import BaseScreenComponent, {
  ContextualHelpPropsMarkdown
} from "../../components/screens/BaseScreenComponent";
import FooterWithButtons from "../../components/ui/FooterWithButtons";
import I18n from "../../i18n";
import { IOStackNavigationProp } from "../../navigation/params/AppParamsList";
import { OnboardingParamsList } from "../../navigation/params/OnboardingParamsList";
import { navigateToEmailReadScreen } from "../../store/actions/navigation";
import {
  abortOnboarding,
  emailAcknowledged,
  emailInsert
} from "../../store/actions/onboarding";
import { profileLoadRequest, profileUpsert } from "../../store/actions/profile";
import { Dispatch, ReduxProps } from "../../store/actions/types";
import {
  isProfileEmailValidatedSelector,
  profileEmailSelector,
  profileSelector
} from "../../store/reducers/profile";
import { GlobalState } from "../../store/reducers/types";
import { withKeyboard } from "../../utils/keyboard";
import { isOnboardingCompleted } from "../../utils/navigation";
import { areStringsEqual } from "../../utils/options";
import { showToast } from "../../utils/showToast";

type Props = ReduxProps &
  ReturnType<typeof mapDispatchToProps> &
  ReturnType<typeof mapStateToProps> & {
    navigation: IOStackNavigationProp<
      OnboardingParamsList,
      "INSERT_EMAIL_SCREEN"
    >;
  };

const styles = StyleSheet.create({
  flex: {
    flex: 1
  },
  icon: {
    marginTop: Platform.OS === "android" ? 4 : 6 // adjust icon position to align it with baseline of email text}
  }
});

const EMPTY_EMAIL = "";

type State = Readonly<{
  email: O.Option<string>;
  isMounted: boolean;
}>;

// TODO: update content (https://www.pivotaltracker.com/n/projects/2048617/stories/169392558)
const contextualHelpMarkdown: ContextualHelpPropsMarkdown = {
  title: "email.insert.help.title",
  body: "email.insert.help.content"
};

/**
 * A screen to allow user to insert an email address.
 */
class EmailInsertScreen extends React.PureComponent<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { email: this.props.optionEmail, isMounted: true };
  }

  private continueOnPress = () => {
    Keyboard.dismiss();
    if (this.isValidEmail()) {
      // The profile is reloaded to check if the user email
      // has been updated within another session
      this.props.reloadProfile();
    }
  };

  private renderFooterButtons = () => {
    const continueButtonProps = {
      disabled: this.isValidEmail() !== true && !this.props.isLoading,
      onPress: this.continueOnPress,
      title: I18n.t("global.buttons.continue"),
      block: true,
      primary: this.isValidEmail()
    };

    return (
      <FooterWithButtons
        type={"SingleButton"}
        leftButton={continueButtonProps}
      />
    );
  };

  /** validate email returning three possible values:
   * - _true_,      if email is valid.
   * - _false_,     if email has been already changed from the user and it is not
   * valid.
   * - _undefined_, if email field is empty. This state is consumed by
   * LabelledItem Component and it used for style pourposes ONLY.
   */
  private isValidEmail = () =>
    pipe(
      this.state.email,
      O.map(value => {
        if (EMPTY_EMAIL === value) {
          return undefined;
        }
        return E.isRight(EmailString.decode(value));
      }),
      O.toUndefined
    );

  private handleOnChangeEmailText = (value: string) => {
    this.setState({
      email: value !== EMPTY_EMAIL ? O.some(value) : O.none
    });
  };

  private handleGoBack = () => {
    // goback if the onboarding is completed
    if (isOnboardingCompleted()) {
      this.setState({ isMounted: false }, () => this.props.navigation.goBack());
    }
    // if the onboarding is not completed and the email is set, force goback with a reset (user could edit his email and go back without saving)
    // see https://www.pivotaltracker.com/story/show/171424350
    else if (O.isSome(this.props.optionEmail)) {
      this.setState({ isMounted: false }, () => {
        this.navigateToEmailReadScreen();
      });
    } else {
      // if the user is in onboarding phase, go back has to
      // abort login (an user with no email can't access the home)
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
  };

  private navigateToEmailReadScreen = () => {
    this.props.navigation.dispatch(StackActions.popToTop());
    navigateToEmailReadScreen();
  };

  public componentDidMount() {
    if (isOnboardingCompleted()) {
      this.setState({ email: O.some(EMPTY_EMAIL) });
    }
  }

  public componentDidUpdate(prevProps: Props) {
    const isPrevCurrentSameState =
      prevProps.profile.kind === this.props.profile.kind;
    // do nothing if prev profile is in the same state of the current
    if (!this.state.isMounted || isPrevCurrentSameState) {
      return;
    }
    // if we were updating the profile
    if (pot.isUpdating(prevProps.profile)) {
      // and we got an error
      if (pot.isError(this.props.profile)) {
        // display a toast with error
        showToast(I18n.t("email.edit.upsert_ko"), "danger");
      } else if (pot.isSome(this.props.profile)) {
        // user is inserting his email from onboarding phase
        // he comes from checkAcknowledgedEmailSaga if onboarding is not finished yet
        // and he has not an email
        if (!isOnboardingCompleted() && O.isNone(prevProps.optionEmail)) {
          // since this screen is mounted from saga it won't be unmounted because on saga
          // we have a direct navigation instead of back
          // so we have to force a reset (to get this screen unmounted) and navigate to emailReadScreen
          // isMounted is used as a guard to prevent update while the screen is unmounting
          this.setState({ isMounted: false }, () => {
            this.props.acknowledgeEmailInsert();
            this.navigateToEmailReadScreen();
          });
          return;
        }
        // go back (to the EmailReadScreen)
        this.handleGoBack();
        return;
      }
    }

    // When the profile reload is completed, check if the email is changed since the last reload
    if (
      pot.isLoading(prevProps.profile) &&
      !pot.isLoading(this.props.profile)
    ) {
      // Check both if the email has been changed within another session and
      // if the inserted email match with the email stored into the user profile
      const isTheSameEmail = areStringsEqual(
        this.props.optionEmail,
        this.state.email,
        true
      );
      if (!isTheSameEmail) {
        pipe(
          this.state.email,
          O.map(e => {
            this.props.updateEmail(e as EmailString);
          })
        );
      } else {
        Alert.alert(I18n.t("email.insert.alert"));
      }
    }
  }

  public render() {
    const isFromProfileSection = isOnboardingCompleted();
    return (
      <BaseScreenComponent
        goBack={this.handleGoBack}
        headerTitle={
          isFromProfileSection
            ? I18n.t("profile.data.list.email")
            : I18n.t("email.insert.header")
        }
        contextualHelpMarkdown={contextualHelpMarkdown}
      >
        <SafeAreaView style={styles.flex}>
          <Content noPadded={true} style={styles.flex} scrollEnabled={false}>
            <View style={IOStyles.horizontalContentPadding}>
              <H1 color={"bluegreyDark"} weight={"Bold"}>
                {isFromProfileSection
                  ? I18n.t("email.edit.title")
                  : I18n.t("email.insert.title")}
              </H1>
              <VSpacer size={16} />
              <Body>
                {isFromProfileSection
                  ? this.props.isEmailValidated
                    ? I18n.t("email.edit.validated")
                    : I18n.t("email.edit.subtitle")
                  : I18n.t("email.insert.subtitle")}
                {isFromProfileSection && (
                  <Body weight="SemiBold">
                    {` ${pipe(
                      this.props.optionEmail,
                      O.getOrElse(() => "")
                    )}`}
                  </Body>
                )}
              </Body>
              <VSpacer size={16} />

              <Form>
                <LabelledItem
                  label={
                    isFromProfileSection
                      ? I18n.t("email.edit.label")
                      : I18n.t("email.insert.label")
                  }
                  icon="io-envelope"
                  isValid={this.isValidEmail()}
                  inputProps={{
                    returnKeyType: "done",
                    onSubmitEditing: this.continueOnPress,
                    autoCapitalize: "none",
                    keyboardType: "email-address",
                    value: pipe(
                      this.state.email,
                      O.getOrElse(() => EMPTY_EMAIL)
                    ),
                    onChangeText: this.handleOnChangeEmailText
                  }}
                  iconStyle={styles.icon}
                />
              </Form>
            </View>
          </Content>

          {withKeyboard(this.renderFooterButtons())}
        </SafeAreaView>
      </BaseScreenComponent>
    );
  }
}

function mapStateToProps(state: GlobalState) {
  const profile = profileSelector(state);
  return {
    profile,
    optionEmail: profileEmailSelector(state),
    isEmailValidated: isProfileEmailValidatedSelector(state),
    isLoading: pot.isUpdating(profile) || pot.isLoading(profile)
  };
}

const mapDispatchToProps = (dispatch: Dispatch) => ({
  updateEmail: (email: EmailString) =>
    dispatch(
      profileUpsert.request({
        email
      })
    ),
  acknowledgeEmailInsert: () => dispatch(emailInsert()),
  acknowledgeEmail: () => dispatch(emailAcknowledged()),
  abortOnboarding: () => dispatch(abortOnboarding()),
  reloadProfile: () => dispatch(profileLoadRequest())
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(withLoadingSpinner(EmailInsertScreen));
