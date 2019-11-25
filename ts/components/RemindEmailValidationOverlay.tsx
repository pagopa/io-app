/**
 * A component to remind the user to validate his email
 */
import I18n from "i18n-js";
import * as pot from "italia-ts-commons/lib/pot";
import { Millisecond } from "italia-ts-commons/lib/units";
import { Button, Content, H2, Text, View } from "native-base";
import * as React from "react";
import { Alert, BackHandler, Image, StyleSheet } from "react-native";
import { connect } from "react-redux";
import {
  navigateBack,
  navigateToEmailInsertScreen
} from "../store/actions/navigation";
import {
  abortOnboarding,
  emailAcknowledged
} from "../store/actions/onboarding";
import {
  loadProfileRequest,
  startEmailValidation
} from "../store/actions/profile";
import { Dispatch } from "../store/actions/types";
import { emailValidationSelector } from "../store/reducers/emailValidation";
import { isOnboardingCompletedSelector } from "../store/reducers/navigationHistory";
import {
  isProfileEmailValidatedSelector,
  profileEmailSelector,
  profileSelector
} from "../store/reducers/profile";
import { GlobalState } from "../store/reducers/types";
import { showToast } from "../utils/showToast";
import TopScreenComponent, {
  TopScreenComponentProps
} from "./screens/TopScreenComponent";
import FooterWithButtons from "./ui/FooterWithButtons";
import IconFont from "./ui/IconFont";
import Markdown from "./ui/Markdown";

type Props = ReturnType<typeof mapDispatchToProps> &
  ReturnType<typeof mapStateToProps>;

type State = {
  ctaSendEmailValidationText: string;
  isLoading: boolean;
  isCtaSentEmailValidationDisabled: boolean;
  closedByUser: boolean;
  isContentLoadCompleted: boolean;
};

const styles = StyleSheet.create({
  imageChecked: {
    alignSelf: "center"
  },
  emailTitle: {
    textAlign: "center"
  }
});

const emailSentTimeout = 10000 as Millisecond; // 10 seconds
const profilePolling = 5000 as Millisecond; // 5 seconds

const EMPTY_EMAIL = "";

class RemindEmailValidationOverlay extends React.PureComponent<Props, State> {
  private idTimeout?: number;
  private idPolling?: number;

  constructor(props: Props) {
    super(props);
    this.state = {
      ctaSendEmailValidationText: I18n.t("email.validate.cta"),
      isLoading: false,
      closedByUser: false,
      isContentLoadCompleted: false,
      isCtaSentEmailValidationDisabled: false
    };
  }

  public componentDidMount() {
    BackHandler.addEventListener("hardwareBackPress", this.props.navigateBack);
    // Periodically check if the user validate his own email address
    // tslint:disable-next-line: no-object-mutation
    this.idPolling = setInterval(this.props.reloadProfile, profilePolling);
    this.props.reloadProfile();
  }

  public componentWillUnmount() {
    BackHandler.removeEventListener(
      "hardwareBackPress",
      this.props.navigateBack
    );
    // if a timeout is running we have to stop it
    if (this.idTimeout !== undefined) {
      clearTimeout(this.idTimeout);
    }
    clearInterval(this.idPolling);

    if (this.props.isEmailValidated && !this.state.closedByUser) {
      // If the compoment is unmounted without the user iteraction, a toast will be displayed
      // TODO: we could use the toast as customized within https://www.pivotaltracker.com/story/show/169568823
      showToast(I18n.t("email.validate.validation_ok"), "success");
    }
  }

  private handleSendEmailValidationButton = () => {
    // send email validation only if it exists
    this.props.optionEmail.map(_ => {
      this.props.sendEmailValidation();
    });
    this.setState({
      isLoading: true,
      isCtaSentEmailValidationDisabled: true
    });
  };

  private handleOnClose = () => {
    // do nothing if it is loading
    if (this.state.isLoading) {
      return;
    }
    this.setState({ closedByUser: true });
    this.props.reloadProfile();
    if (!this.props.isOnboardingCompleted) {
      this.props.acknowledgeEmailInsert();
    } else {
      this.props.navigateBack();
    }
  };

  public componentDidUpdate(prevProps: Props) {
    // if we were sending again the validation email
    if (pot.isLoading(prevProps.emailValidation)) {
      // and we got an error
      if (pot.isError(this.props.emailValidation)) {
        this.setState({
          ctaSendEmailValidationText: I18n.t("email.validate.cta"),
          isLoading: false,
          isCtaSentEmailValidationDisabled: false
        });
      } else if (pot.isSome(this.props.emailValidation)) {
        // schedule a timeout to make the cta button disabled and showing inside
        // the string that email has been sent.
        // after timeout we restore the default state
        // tslint:disable-next-line: no-object-mutation
        this.idTimeout = setTimeout(() => {
          // tslint:disable-next-line: no-object-mutation
          this.idTimeout = undefined;
          this.setState({
            ctaSendEmailValidationText: I18n.t("email.validate.cta"),
            isCtaSentEmailValidationDisabled: false
          });
        }, emailSentTimeout);
        this.setState({
          ctaSendEmailValidationText: I18n.t("email.validate.sent"),
          isLoading: false
        });
      }
    }
  }

  private contextualHelp = {
    title: I18n.t("email.validate.title"),
    body: () => <Markdown>{I18n.t("email.validate.help")}</Markdown>
  };

  private handleOnboardingGoBack = () =>
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
          onPress: () => this.props.abortOnboarding()
        }
      ]
    );

  private customOnboardingGoBack = (
    <IconFont name={"io-back"} onPress={this.handleOnboardingGoBack} />
  );

  private onMainProps: TopScreenComponentProps = {
    customRightIcon: {
      iconName: "io-close",
      onPress: this.props.navigateBack
    }
  };

  private onBoardingProps: TopScreenComponentProps = {
    headerTitle: I18n.t("email.validate.header"),
    title: I18n.t("email.validate.title"),
    customGoBack: this.customOnboardingGoBack
  };

  private handleOnContentLoadEnd = () => {
    this.setState({ isContentLoadCompleted: true });
  };

  public render() {
    const email = this.props.optionEmail.getOrElse(EMPTY_EMAIL);
    const { isOnboardingCompleted } = this.props;
    return (
      <TopScreenComponent
        {...(isOnboardingCompleted ? this.onMainProps : this.onBoardingProps)}
        contextualHelp={this.contextualHelp}
      >
        <Content>
          {isOnboardingCompleted && (
            <React.Fragment>
              <Image
                style={styles.imageChecked}
                source={require("../../img/email-checked-icon.png")}
              />
              <View spacer={true} extralarge={true} />
            </React.Fragment>
          )}
          <H2 style={isOnboardingCompleted ? styles.emailTitle : undefined}>
            {I18n.t("email.validate.title")}
          </H2>
          <View spacer={true} />
          <Markdown onLoadEnd={this.handleOnContentLoadEnd}>
            {isOnboardingCompleted
              ? I18n.t("email.validate.content2", { email })
              : I18n.t("email.validate.content1", { email })}
          </Markdown>
          <View spacer={true} />
          {this.state.isContentLoadCompleted && (
            <Button
              block={true}
              light={true}
              bordered={true}
              disabled={
                this.state.isLoading ||
                this.state.isCtaSentEmailValidationDisabled
              }
              onPress={this.handleSendEmailValidationButton}
            >
              <Text>{this.state.ctaSendEmailValidationText}</Text>
            </Button>
          )}
        </Content>
        <FooterWithButtons
          type={"TwoButtonsInlineThirdInverted"}
          leftButton={{
            block: true,
            bordered: true,
            disabled: this.state.isLoading,
            onPress: this.props.navigateToEmailInsertScreen,
            title: I18n.t("email.edit.title")
          }}
          rightButton={{
            block: true,
            primary: true,
            onPress: this.handleOnClose,
            disabled: this.state.isLoading,
            title: isOnboardingCompleted
              ? I18n.t("global.buttons.ok")
              : I18n.t("global.buttons.continue")
          }}
        />
      </TopScreenComponent>
    );
  }
}

const mapStateToProps = (state: GlobalState) => {
  const isEmailValidated = isProfileEmailValidatedSelector(state);
  const emailValidation = emailValidationSelector(state);
  const potProfile = profileSelector(state);
  return {
    emailValidation,
    optionEmail: profileEmailSelector(state),
    isEmailValidated,
    potProfile,
    isOnboardingCompleted: isOnboardingCompletedSelector(state)
  };
};

const mapDispatchToProps = (dispatch: Dispatch) => ({
  sendEmailValidation: () => dispatch(startEmailValidation.request()),
  navigateBack: () => dispatch(navigateBack()),
  reloadProfile: () => {
    // Refresh profile to check if the email address has been validated
    dispatch(loadProfileRequest());
  },
  navigateToEmailInsertScreen: () => {
    dispatch(navigateToEmailInsertScreen());
  },
  acknowledgeEmailInsert: () => dispatch(emailAcknowledged()),
  abortOnboarding: () => dispatch(abortOnboarding())
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(RemindEmailValidationOverlay);
