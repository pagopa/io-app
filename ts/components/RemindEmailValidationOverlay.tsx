/**
 * A component to remind the user to validate his email
 */
import { none, Option, some } from "fp-ts/lib/Option";
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
  acknowledgeOnEmailValidation,
  profileLoadRequest,
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
import customVariables from "../theme/variables";
import TopScreenComponent, {
  TopScreenComponentProps
} from "./screens/TopScreenComponent";
import FooterWithButtons from "./ui/FooterWithButtons";
import IconFont from "./ui/IconFont";
import Markdown from "./ui/Markdown";

type OwnProp = {
  closeModalAndNavigateToEmailInsertScreen: () => void;
};

type Props = ReturnType<typeof mapDispatchToProps> &
  ReturnType<typeof mapStateToProps> &
  OwnProp;

type State = {
  ctaSendEmailValidationText: string;
  isLoading: boolean;
  isCtaSentEmailValidationDisabled: boolean;
  isContentLoadCompleted: boolean;
  emailHasBeenValidate: boolean;
  displayError: boolean;
};

const styles = StyleSheet.create({
  imageChecked: {
    alignSelf: "center"
  },
  emailTitle: {
    textAlign: "center"
  },
  error: {
    backgroundColor: customVariables.brandDanger,
    paddingHorizontal: customVariables.contentPadding,
    paddingVertical: 11,
    flexDirection: "row",
    justifyContent: "space-between"
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
      isContentLoadCompleted: false,
      isCtaSentEmailValidationDisabled: false,
      emailHasBeenValidate: false,
      displayError: false
    };
  }

  public componentDidMount() {
    BackHandler.addEventListener("hardwareBackPress", this.props.navigateBack);
    // Periodically check if the user validate his own email address
    // tslint:disable-next-line: no-object-mutation
    this.idPolling = setInterval(this.props.reloadProfile, profilePolling);
    this.props.reloadProfile();
    // since we are here, set the user doesn't acknowledge about the email validation
    this.props.dispatchAcknowledgeOnEmailValidation(some(false));
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
    this.props.dispatchAcknowledgeOnEmailValidation(none);
    this.props.reloadProfile();
    if (!this.props.isOnboardingCompleted) {
      this.props.acknowledgeEmailInsert();
    } else {
      this.props.navigateBack();
    }
  };

  public componentDidUpdate(prevProps: Props) {
    // if we were sending again the validation email
    if (pot.isLoading(prevProps.emailValidationRequest)) {
      // and we got an error
      if (pot.isError(this.props.emailValidationRequest)) {
        this.setState({
          ctaSendEmailValidationText: I18n.t("email.validate.cta"),
          isLoading: false,
          isCtaSentEmailValidationDisabled: false
        });
        if (!this.state.displayError) {
          this.setState({ displayError: true });
        }
      } else if (pot.isSome(this.props.emailValidationRequest)) {
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
          isLoading: false,
          displayError: false
        });
      }
    }

    // if the email becomes validated
    if (!prevProps.isEmailValidated && this.props.isEmailValidated) {
      // and the user doesn't acknowledgeknow about validation
      this.props.acknowledgeOnEmailValidated.map(v => {
        if (v === false && this.state.emailHasBeenValidate === false) {
          this.setState({ emailHasBeenValidate: true });
        }
      });
    }
  }

  private renderErrorBanner = (
    <View style={styles.error}>
      <Text white={true}>{I18n.t("global.actions.retry")}</Text>
      <View>
        <IconFont
          name={"io-close"}
          onPress={() => {
            this.setState({ displayError: false });
          }}
          color={customVariables.colorWhite}
          accessible={true}
          accessibilityLabel={I18n.t("global.buttons.close")}
        />
      </View>
    </View>
  );

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
    customGoBack: this.customOnboardingGoBack
  };

  private handleOnContentLoadEnd = () => {
    this.setState({ isContentLoadCompleted: true });
  };

  private renderFooter = () => {
    const { isOnboardingCompleted } = this.props;
    // if the email has been validated
    // show only a button to continuer
    if (this.state.emailHasBeenValidate) {
      return (
        <FooterWithButtons
          type={"SingleButton"}
          leftButton={{
            block: true,
            primary: true,
            onPress: this.handleOnClose,
            disabled: this.state.isLoading,
            title: I18n.t("global.buttons.continue")
          }}
        />
      );
    }
    // show two buttons where the left one is a CTA
    // to edit again the email
    return (
      <FooterWithButtons
        type={"TwoButtonsInlineThirdInverted"}
        leftButton={{
          block: true,
          bordered: true,
          disabled: this.state.isLoading,
          onPress: () => {
            if (!isOnboardingCompleted) {
              this.props.closeModalAndNavigateToEmailInsertScreen();
              return;
            }
            this.props.navigateToEmailInsertScreen();
          },
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
    );
  };

  public render() {
    const email = this.props.optionEmail.getOrElse(EMPTY_EMAIL);
    const { isOnboardingCompleted } = this.props;
    const image = this.state.emailHasBeenValidate
      ? require("../../img/email-checked-icon_ok.png")
      : require("../../img/email-checked-icon.png");
    const title = this.state.emailHasBeenValidate
      ? I18n.t("email.validate.validated")
      : I18n.t("email.validate.title");
    return (
      <TopScreenComponent
        {...(isOnboardingCompleted ? this.onMainProps : this.onBoardingProps)}
        contextualHelp={this.contextualHelp}
      >
        <Content>
          <React.Fragment>
            <Image style={styles.imageChecked} source={image} />
            <View spacer={true} extralarge={true} />
          </React.Fragment>
          <H2 style={isOnboardingCompleted ? styles.emailTitle : undefined}>
            {title}
          </H2>
          <View spacer={true} />
          {!this.state.emailHasBeenValidate ? (
            <Markdown onLoadEnd={this.handleOnContentLoadEnd}>
              {isOnboardingCompleted
                ? I18n.t("email.validate.content2", { email })
                : I18n.t("email.validate.content1", { email })}
            </Markdown>
          ) : (
            <Text>{I18n.t("email.validate.validated_ok")}</Text>
          )}
          <View spacer={true} />
          {this.state.isContentLoadCompleted &&
            !this.state.emailHasBeenValidate && (
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
          <View spacer={true} large={true} />
        </Content>
        {this.state.displayError && this.renderErrorBanner}
        {(this.state.emailHasBeenValidate ||
          this.state.isContentLoadCompleted) &&
          this.renderFooter()}
      </TopScreenComponent>
    );
  }
}

const mapStateToProps = (state: GlobalState) => {
  const isEmailValidated = isProfileEmailValidatedSelector(state);
  const emailValidation = emailValidationSelector(state);
  const potProfile = profileSelector(state);
  return {
    emailValidationRequest: emailValidation.sendEmailValidationRequest,
    acknowledgeOnEmailValidated: emailValidation.acknowledgeOnEmailValidated,
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
    dispatch(profileLoadRequest());
  },
  navigateToEmailInsertScreen: () => {
    dispatch(navigateToEmailInsertScreen());
  },
  acknowledgeEmailInsert: () => dispatch(emailAcknowledged()),
  dispatchAcknowledgeOnEmailValidation: (maybeAcknowledged: Option<boolean>) =>
    dispatch(acknowledgeOnEmailValidation(maybeAcknowledged)),
  abortOnboarding: () => dispatch(abortOnboarding())
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(RemindEmailValidationOverlay);
