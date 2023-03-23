/**
 * A component to remind the user to validate his email
 */
import * as pot from "@pagopa/ts-commons/lib/pot";
import { Millisecond } from "@pagopa/ts-commons/lib/units";
import { pipe } from "fp-ts/lib/function";
import * as O from "fp-ts/lib/Option";
import { Content, Text as NBText } from "native-base";
import * as React from "react";
import {
  View,
  Alert,
  BackHandler,
  NativeEventSubscription,
  StyleSheet
} from "react-native";
import { connect } from "react-redux";
import { IOColors } from "../components/core/variables/IOColors";
import I18n from "../i18n";
import NavigationService from "../navigation/NavigationService";
import ROUTES from "../navigation/routes";
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
import {
  isProfileEmailValidatedSelector,
  profileEmailSelector,
  profileSelector
} from "../store/reducers/profile";
import { GlobalState } from "../store/reducers/types";
import customVariables from "../theme/variables";
import { isOnboardingCompleted } from "../utils/navigation";
import { FCI_ROUTES } from "../features/fci/navigation/routes";
import { VSpacer } from "./core/spacer/Spacer";
import { IOStyles } from "./core/variables/IOStyles";
import { ContextualHelpPropsMarkdown } from "./screens/BaseScreenComponent";
import TopScreenComponent, {
  TopScreenComponentProps
} from "./screens/TopScreenComponent";
import SectionStatusComponent from "./SectionStatus";
import TouchableDefaultOpacity from "./TouchableDefaultOpacity";
import BlockButtons from "./ui/BlockButtons";
import FooterWithButtons from "./ui/FooterWithButtons";
import IconFont from "./ui/IconFont";
import Markdown from "./ui/Markdown";

type OwnProp = {
  onClose: () => void;
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
  center: {
    alignSelf: "center"
  },
  error: {
    backgroundColor: customVariables.brandDanger,
    paddingHorizontal: customVariables.contentPadding,
    paddingVertical: 11,
    flexDirection: "row",
    justifyContent: "space-between"
  },
  validated: {
    paddingTop: 8,
    paddingHorizontal: 30
  }
});

const emailSentTimeout = 10000 as Millisecond; // 10 seconds
const profilePolling = 5000 as Millisecond; // 5 seconds

const EMPTY_EMAIL = "";
const MARKDOWN_BODY_STYLE = "body { text-align: center;}";
const VALIDATION_ICON_WIDTH = 84;
const emailCtaKey = "email.validate.cta";

class RemindEmailValidationOverlay extends React.PureComponent<Props, State> {
  private idTimeout?: number;
  private idPolling?: number;
  private subscription: NativeEventSubscription | undefined;

  constructor(props: Props) {
    super(props);
    this.state = {
      ctaSendEmailValidationText: I18n.t(emailCtaKey),
      isLoading: false,
      isContentLoadCompleted: false,
      isCtaSentEmailValidationDisabled: false,
      emailHasBeenValidate: false,
      displayError: false
    };
  }

  private handleHardwareBack = () => {
    if (isOnboardingCompleted()) {
      this.props.navigateBack();
    }
    return true;
  };

  public componentDidMount() {
    // eslint-disable-next-line functional/immutable-data
    this.subscription = BackHandler.addEventListener(
      "hardwareBackPress",
      this.handleHardwareBack
    );
    // Periodically check if the user validate his own email address
    // eslint-disable-next-line
    this.idPolling = setInterval(this.props.reloadProfile, profilePolling);
    this.props.reloadProfile();
    // since we are here, set the user doesn't acknowledge about the email validation
    this.props.dispatchAcknowledgeOnEmailValidation(O.some(false));
  }

  public componentWillUnmount() {
    this.subscription?.remove();
    // if a timeout is running we have to stop it
    if (this.idTimeout !== undefined) {
      clearTimeout(this.idTimeout);
    }
    clearInterval(this.idPolling);
  }

  private handleSendEmailValidationButton = () => {
    // send email validation only if it exists
    pipe(
      this.props.optionEmail,
      O.map(_ => {
        this.props.sendEmailValidation();
      })
    );
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
    this.props.dispatchAcknowledgeOnEmailValidation(O.none);
    this.props.reloadProfile();
    if (!isOnboardingCompleted()) {
      this.props.acknowledgeEmailInsert();
    } else {
      this.props.navigateBack();
    }
    this.props.onClose();
  };

  public componentDidUpdate(prevProps: Props) {
    // if we were sending again the validation email
    if (pot.isLoading(prevProps.emailValidationRequest)) {
      // and we got an error
      if (pot.isError(this.props.emailValidationRequest)) {
        this.setState({
          ctaSendEmailValidationText: I18n.t(emailCtaKey),
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
        // eslint-disable-next-line
        this.idTimeout = setTimeout(() => {
          // eslint-disable-next-line
          this.idTimeout = undefined;
          this.setState({
            ctaSendEmailValidationText: I18n.t(emailCtaKey),
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
      pipe(
        this.props.acknowledgeOnEmailValidated,
        O.map(v => {
          if (v === false && this.state.emailHasBeenValidate === false) {
            this.setState({ emailHasBeenValidate: true });
          }
        })
      );
    }
  }

  private renderErrorBanner = (
    <View style={styles.error}>
      <NBText white={true}>{I18n.t("global.actions.retry")}</NBText>
      <View>
        <IconFont
          name={"io-close"}
          onPress={() => {
            this.setState({ displayError: false });
          }}
          color={IOColors.white}
          accessible={true}
          accessibilityLabel={I18n.t("global.buttons.close")}
        />
      </View>
    </View>
  );

  private contextualHelpMarkdown: ContextualHelpPropsMarkdown = {
    title: "email.validate.title",
    body: "email.validate.help"
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
    <TouchableDefaultOpacity
      onPress={this.handleOnboardingGoBack}
      accessible={true}
      accessibilityLabel={I18n.t("global.buttons.back")}
      accessibilityRole={"button"}
    >
      <IconFont name={"io-back"} />
    </TouchableDefaultOpacity>
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
    const onboardingCompleted = isOnboardingCompleted();
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
      <>
        <SectionStatusComponent sectionKey={"email_validation"} />
        <View style={IOStyles.footer}>
          <BlockButtons
            type={"SingleButton"}
            leftButton={{
              title: this.state.ctaSendEmailValidationText,
              onPress: this.handleSendEmailValidationButton,
              light: true,
              bordered: true,
              disabled:
                this.state.isLoading ||
                this.state.isCtaSentEmailValidationDisabled
            }}
          />
          <VSpacer size={16} />
          <BlockButtons
            type={"TwoButtonsInlineThirdInverted"}
            leftButton={{
              block: true,
              bordered: true,
              disabled: this.state.isLoading,
              onPress: () => {
                /**
                 * TODO: this is a temp workaround to complete porting a react-navigation v5
                 * without a full rework of all the related email / isOnboardingCompleted screens
                 * Will be removed in https://pagopa.atlassian.net/browse/IAI-139 . We want:
                 * - Have a common component with the shared logic
                 * - Compose the common logic with the navigation stack dependent logic and isolate the dependent navigation logic
                 */
                if (
                  NavigationService.getCurrentRouteName() ===
                    ROUTES.WALLET_HOME ||
                  pipe(
                    NavigationService.getCurrentRouteName(),
                    O.fromNullable,
                    O.map(currentRoute =>
                      (Object.values(FCI_ROUTES) as Array<string>).includes(
                        currentRoute
                      )
                    ),
                    O.getOrElse(() => false)
                  )
                ) {
                  NavigationService.navigate(ROUTES.PROFILE_NAVIGATOR, {
                    screen: ROUTES.INSERT_EMAIL_SCREEN
                  });
                } else {
                  navigateToEmailInsertScreen();
                }
              },
              title: I18n.t("email.edit.title")
            }}
            rightButton={{
              block: true,
              primary: true,
              onPress: this.handleOnClose,
              disabled: this.state.isLoading,
              title: onboardingCompleted
                ? I18n.t("global.buttons.ok")
                : I18n.t("global.buttons.continue")
            }}
          />
        </View>
      </>
    );
  };

  public render() {
    const email = pipe(
      this.props.optionEmail,
      O.getOrElse(() => EMPTY_EMAIL)
    );

    const onboardingCompleted = isOnboardingCompleted();

    const icon = this.state.emailHasBeenValidate
      ? "io-email-validated"
      : "io-email-to-validate";

    const title = this.state.emailHasBeenValidate
      ? I18n.t("email.validate.validated")
      : I18n.t("email.validate.title");

    return (
      <TopScreenComponent
        {...(onboardingCompleted ? this.onMainProps : this.onBoardingProps)}
        contextualHelpMarkdown={this.contextualHelpMarkdown}
        accessibilityEvents={{ avoidNavigationEventsUsage: true }}
      >
        <Content bounces={false}>
          <VSpacer size={40} />
          <IconFont
            name={icon}
            size={VALIDATION_ICON_WIDTH}
            color={customVariables.colorHighlight}
            style={styles.center}
          />
          <VSpacer size={40} />
          <NBText alignCenter={true} bold={true}>
            {title}
          </NBText>
          {!this.state.emailHasBeenValidate ? (
            <Markdown
              onLoadEnd={this.handleOnContentLoadEnd}
              cssStyle={MARKDOWN_BODY_STYLE}
            >
              {onboardingCompleted
                ? I18n.t("email.validate.content2", { email })
                : I18n.t("email.validate.content1", { email })}
            </Markdown>
          ) : (
            <View style={styles.validated}>
              <NBText alignCenter={true}>
                {I18n.t("email.validate.validated_ok")}
              </NBText>
            </View>
          )}
          <VSpacer size={24} />
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
    potProfile
  };
};

const mapDispatchToProps = (dispatch: Dispatch) => ({
  sendEmailValidation: () => dispatch(startEmailValidation.request()),
  navigateBack: () => navigateBack(),
  reloadProfile: () => {
    // Refresh profile to check if the email address has been validated
    dispatch(profileLoadRequest());
  },
  acknowledgeEmailInsert: () => dispatch(emailAcknowledged()),
  dispatchAcknowledgeOnEmailValidation: (
    maybeAcknowledged: O.Option<boolean>
  ) => dispatch(acknowledgeOnEmailValidation(maybeAcknowledged)),
  abortOnboarding: () => dispatch(abortOnboarding())
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(RemindEmailValidationOverlay);
