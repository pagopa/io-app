import * as pot from "italia-ts-commons/lib/pot";
import { Button, Text, View } from "native-base";
import * as React from "react";
import { Alert, StyleSheet } from "react-native";
import { connect } from "react-redux";

import { Millisecond } from "italia-ts-commons/lib/units";
import { NavigationScreenProps } from "react-navigation";
import { withLoadingSpinner } from "../../components/helpers/withLoadingSpinner";
import ScreenContent from "../../components/screens/ScreenContent";
import TopScreenComponent from "../../components/screens/TopScreenComponent";
import FooterWithButtons from "../../components/ui/FooterWithButtons";
import Markdown from "../../components/ui/Markdown";
import I18n from "../../i18n";
import ROUTES from "../../navigation/routes";
import { navigateToEmailInsertScreen } from "../../store/actions/navigation";
import {
  abortOnboarding,
  emailAcknowledged
} from "../../store/actions/onboarding";
import {
  loadProfileRequest,
  startEmailValidation
} from "../../store/actions/profile";
import { Dispatch, ReduxProps } from "../../store/actions/types";
import { emailValidationSelector } from "../../store/reducers/emailValidation";
import {
  emailProfileSelector,
  isProfileEmailValidatedSelector
} from "../../store/reducers/profile";
import { GlobalState } from "../../store/reducers/types";
import customVariables from "../../theme/variables";
import { showToast } from "../../utils/showToast";

type OwnProps = ReduxProps & ReturnType<typeof mapStateToProps>;

type State = {
  ctaSendEmailValidationText: string;
  isCtaSentEmailValidationDisabled: boolean;
};

type Props = OwnProps &
  ReturnType<typeof mapDispatchToProps> &
  NavigationScreenProps;

const styles = StyleSheet.create({
  spacerLarge: { height: 40 },
  content: {
    paddingHorizontal: customVariables.contentPadding,
    backgroundColor: customVariables.contentBackground,
    flex: 1
  }
});
const buttonTextSize = 15;
const emailSentTimeout = 10000 as Millisecond; // 10 seconds

/**
 * A screen as reminder to the user to validate his email address
 */
export class EmailValidateScreen extends React.PureComponent<Props, State> {
  private idTimeout?: number;

  constructor(props: Props) {
    super(props);
    this.state = {
      ctaSendEmailValidationText: I18n.t("email.validate.cta"),
      isCtaSentEmailValidationDisabled: false
    };
  }

  public componentWillUnmount() {
    // if a timeout is running we have to stop it
    if (this.idTimeout !== undefined) {
      clearTimeout(this.idTimeout);
    }
  }

  public componentDidMount() {
    this.props.loadProfileRequest();
  }

  private contextualHelp = {
    title: I18n.t("email.validate.title"),
    body: () => <Markdown>{I18n.t("email.validate.help")}</Markdown>
  };

  public componentDidUpdate(prevProps: Props) {
    // if we were sending again the validation email
    if (pot.isLoading(prevProps.emailValidation)) {
      // and we got an error
      if (pot.isError(this.props.emailValidation)) {
        // display a toast with error
        showToast(I18n.t("email.validate.send_validation_ko"), "danger");
        this.setState({
          isCtaSentEmailValidationDisabled: false
        });
      } else if (pot.isSome(this.props.emailValidation)) {
        // display a success toast
        showToast(I18n.t("email.validate.send_validation_ok"), "success");
        // schedule a timeout to make the cta button disabled and reporting
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
          isCtaSentEmailValidationDisabled: true
        });
      }
    }
  }

  private handleSendEmailValidationButton = () => {
    // send email validation only if it exists
    this.props.optionEmail.map(_ => {
      this.props.dispatchSendEmailValidation();
    });
    this.setState({
      isCtaSentEmailValidationDisabled: true
    });
  };

  private handleContinueButton = () => {
    this.props.acknowledgeEmail();
  };

  private handleGoBack = () =>
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

  public render() {
    return (
      <TopScreenComponent
        goBack={this.handleGoBack}
        headerTitle={I18n.t("email.validate.header")}
        title={I18n.t("email.validate.title")}
        contextualHelp={this.contextualHelp}
      >
        <ScreenContent title={I18n.t("email.validate.title")}>
          <View style={styles.content}>
            <Markdown>
              {I18n.t("email.validate.info", {
                email: this.props.optionEmail.getOrElse("")
              })}
            </Markdown>
            <View style={styles.spacerLarge} />
            <View>
              <Button
                light={true}
                block={true}
                bordered={true}
                disabled={this.state.isCtaSentEmailValidationDisabled}
                onPress={this.handleSendEmailValidationButton}
              >
                <Text>{this.state.ctaSendEmailValidationText}</Text>
              </Button>
            </View>
          </View>
        </ScreenContent>
        <FooterWithButtons
          type={"TwoButtonsInlineHalf"}
          leftButton={{
            block: true,
            bordered: true,
            title: I18n.t("email.edit.cta"),
            onPress: navigateToEmailInsertScreen,
            buttonFontSize: buttonTextSize
          }}
          rightButton={{
            block: true,
            primary: true,
            title: I18n.t("global.buttons.continue"),
            onPress: this.handleContinueButton
          }}
        />
      </TopScreenComponent>
    );
  }
}

function mapStateToProps(state: GlobalState) {
  const emailValidation = emailValidationSelector(state);
  return {
    emailValidation,
    optionEmail: emailProfileSelector(state),
    isEmailValidated: isProfileEmailValidatedSelector(state),
    isLoading: pot.isLoading(emailValidation)
  };
}

const mapDispatchToProps = (dispatch: Dispatch) => ({
  dispatchSendEmailValidation: () => dispatch(startEmailValidation.request()),
  acknowledgeEmail: () => dispatch(emailAcknowledged()),
  abortOnboarding: () => dispatch(abortOnboarding()),
  navigateToEmailInsertScreen: () => dispatch(navigateToEmailInsertScreen()),
  loadProfileRequest: () => {
    dispatch(loadProfileRequest());
  }
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(withLoadingSpinner(EmailValidateScreen));
