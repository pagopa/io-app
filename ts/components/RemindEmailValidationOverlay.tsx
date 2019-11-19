/**
 * A component to remind the user to validate his/her email
 */
import I18n from "i18n-js";
import * as pot from "italia-ts-commons/lib/pot";
import { Millisecond } from "italia-ts-commons/lib/units";
import { Button, Content, H2, Text, View } from "native-base";
import * as React from "react";
import { BackHandler, Image, StyleSheet } from "react-native";
import { connect } from "react-redux";
import { isEmailEditingAndValidationEnabled } from "../config";
import {
  navigateBack,
  navigateToEmailInsertScreen
} from "../store/actions/navigation";
import { startEmailValidation } from "../store/actions/profile";
import { Dispatch } from "../store/actions/types";
import { emailValidationSelector } from "../store/reducers/emailValidation";
import {
  emailProfileSelector,
  isProfileEmailValidatedSelector
} from "../store/reducers/profile";
import { GlobalState } from "../store/reducers/types";
import TopScreenComponent from "./screens/TopScreenComponent";
import FooterWithButtons from "./ui/FooterWithButtons";

type Props = ReturnType<typeof mapDispatchToProps> &
  ReturnType<typeof mapStateToProps>;

type State = {
  dispatched: boolean;
  ctaSendEmailValidationText: string;
  isCtaSentEmailValidationDisabled: boolean;
};

const styles = StyleSheet.create({
  imageChecked: { alignSelf: "center" },
  emailTitle: { textAlign: "center" }
});

const emailSentTimeout = 10000 as Millisecond; // 10 seconds

class RemindEmailValidationOverlay extends React.PureComponent<Props, State> {
  private idTimeout?: number;
  constructor(props: Props) {
    super(props);
    this.state = {
      dispatched: false,
      ctaSendEmailValidationText: I18n.t("email.validate.cta"),
      isCtaSentEmailValidationDisabled: false
    };
  }

  private handleOkPress = () => {
    this.setState(
      {
        dispatched: true
      },
      this.props.validateEmail
    );
  };

  private handleBackPress = () => {
    this.props.navigateBack();
    return true;
  };

  public componentDidMount() {
    BackHandler.addEventListener("hardwareBackPress", this.handleBackPress);
  }

  public componentWillUnmount() {
    BackHandler.removeEventListener("hardwareBackPress", this.handleBackPress);
    // if a timeout is running we have to stop it
    if (this.idTimeout !== undefined) {
      clearTimeout(this.idTimeout);
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

  public componentDidUpdate(prevProps: Props, prevstate: State) {
    const { isEmailValidate } = this.props;
    const { dispatched } = this.state;
    // The dispatched property is used to store the information that the user
    // has pressed on the OK button, a new email validation is requested.
    // In the case where the request has been made and the user's email is still invalid,
    // the navigateBack is called, otherwise the component will be automatically
    // unmounted from the withValidatedEmail HOC
    if (
      !prevProps.isEmailValidate &&
      !isEmailValidate &&
      prevstate.dispatched &&
      dispatched
    ) {
      this.setState(
        {
          dispatched: false
        },
        this.props.navigateBack
      );
    }
    // if we were sending again the validation email
    if (pot.isLoading(prevProps.emailValidation)) {
      // and we got an error
      if (pot.isError(this.props.emailValidation)) {
        this.setState({
          isCtaSentEmailValidationDisabled: false
        });
      } else if (pot.isSome(this.props.emailValidation)) {
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
          ctaSendEmailValidationText: I18n.t("email.validate.sent")
        });
      }
    }
  }

  public render() {
    const profileEmail = this.props.optionEmail.getOrElse("");
    return (
      <TopScreenComponent
        customRightIcon={{
          iconName: "io-close",
          onPress: this.props.navigateBack
        }}
      >
        <Content>
          <Image
            style={styles.imageChecked}
            source={require("../../img/email-checked-icon.png")}
          />
          <View spacer={true} extralarge={true} />
          <H2 style={styles.emailTitle}>{I18n.t("reminders.email.title")}</H2>
          <View spacer={true} />
          <Text>
            {I18n.t("reminders.email.modal1")}
            <Text bold={true}>{` ${profileEmail} `}</Text>
            {I18n.t("reminders.email.modal2")}
          </Text>
          <View spacer={true} />
          <Button
            block={true}
            light={true}
            bordered={true}
            disabled={this.state.isCtaSentEmailValidationDisabled}
            onPress={this.handleSendEmailValidationButton}
          >
            <Text>{this.state.ctaSendEmailValidationText}</Text>
          </Button>
        </Content>

        <FooterWithButtons
          type={"TwoButtonsInlineThirdInverted"}
          leftButton={{
            block: true,
            bordered: true,
            onPress: () => {
              this.setState(
                {
                  dispatched: false
                },
                this.props.navigateToEmailInsertScreen
              );
            },
            title: I18n.t("reminders.email.button2")
          }}
          rightButton={{
            block: true,
            primary: true,
            onPress: this.handleOkPress,
            title: I18n.t("global.buttons.ok")
          }}
        />
      </TopScreenComponent>
    );
  }
}

const mapStateToProps = (state: GlobalState) => {
  const isEmailValidated = isProfileEmailValidatedSelector(state);
  const emailValidation = emailValidationSelector(state);
  return {
    emailValidation,
    optionEmail: emailProfileSelector(state),
    isEmailValidate: isEmailEditingAndValidationEnabled
      ? isEmailValidated
      : true
  };
};

const mapDispatchToProps = (dispatch: Dispatch) => ({
  dispatchSendEmailValidation: () => dispatch(startEmailValidation.request()),
  navigateBack: () => dispatch(navigateBack()),
  validateEmail: () => undefined, // TODO: add onPress of email verification https://www.pivotaltracker.com/story/show/168662501
  navigateToEmailInsertScreen: () => {
    dispatch(navigateToEmailInsertScreen({ isFromProfileSection: true }));
  }
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(RemindEmailValidationOverlay);
