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
import {
  loadProfileRequest,
  startEmailValidation
} from "../store/actions/profile";
import { Dispatch } from "../store/actions/types";
import { emailValidationSelector } from "../store/reducers/emailValidation";
import {
  emailProfileSelector,
  isProfileEmailValidatedSelector,
  profileSelector
} from "../store/reducers/profile";
import { GlobalState } from "../store/reducers/types";
import { showToast } from "../utils/showToast";
import { withLoadingSpinner } from "./helpers/withLoadingSpinner";
import TopScreenComponent from "./screens/TopScreenComponent";
import FooterWithButtons from "./ui/FooterWithButtons";

type Props = ReturnType<typeof mapDispatchToProps> &
  ReturnType<typeof mapStateToProps>;

type State = {
  ctaSendEmailValidationText: string;
  isCtaSentEmailValidationDisabled: boolean;
  closedByUser: boolean;
};

const styles = StyleSheet.create({
  imageChecked: { alignSelf: "center" },
  emailTitle: { textAlign: "center" }
});

const emailSentTimeout = 10000 as Millisecond; // 10 seconds

class RemindEmailValidationOverlay extends React.PureComponent<Props, State> {
  private idTimeout?: number;
  private idPolling?: number;
  constructor(props: Props) {
    super(props);
    this.state = {
      ctaSendEmailValidationText: I18n.t("email.validate.cta"),
      isCtaSentEmailValidationDisabled: false,
      closedByUser: false
    };
  }

  public componentDidMount() {
    BackHandler.addEventListener("hardwareBackPress", this.props.navigateBack);
    // Periodically check the user validate his email
    // tslint:disable-next-line: no-object-mutation
    this.idPolling = setInterval(this.props.updateValidationInfo, 20000);
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

    if (this.props.isEmailValidate && !this.state.closedByUser) {
      // If the compoment is unmounted without the user iteracion, a toast is displayed
      // TODO: we could use the toast as customized within https://www.pivotaltracker.com/story/show/169568823
      showToast(
        "La mail è stata validata! Ora puoi accedere a tutte le funzionalità di IO.",
        "success"
      );
    }
  }

  private handleSendEmailValidationButton = () => {
    // send email validation only if it exists
    this.props.optionEmail.map(_ => {
      this.props.sendEmailValidation();
    });
    this.setState({
      isCtaSentEmailValidationDisabled: true
    });
  };

  private closeModal = () => {
    this.setState({ closedByUser: true });
    this.props.updateValidationInfo();
  };

  public componentDidUpdate(prevProps: Props) {
    // In the case where the request has been made and the user's email is still invalid,
    // the navigateBack is called, otherwise the component will be automatically
    // unmounted by the withValidatedEmail HOC and the WrappedCompoent is displayed
    if (
      this.state.closedByUser &&
      !prevProps.isEmailValidate &&
      !this.props.isEmailValidate
    ) {
      this.props.navigateBack();
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
          onPress: this.closeModal
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
            onPress: this.props.navigateToEmailInsertScreen,
            title: I18n.t("reminders.email.button2")
          }}
          rightButton={{
            block: true,
            primary: true,
            onPress: this.closeModal,
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
  const potProfile = profileSelector(state);
  return {
    emailValidation,
    optionEmail: emailProfileSelector(state),
    isEmailValidate: isEmailEditingAndValidationEnabled
      ? isEmailValidated
      : true,
    potProfile,
    isLoading: pot.isLoading(potProfile)
  };
};

const mapDispatchToProps = (dispatch: Dispatch) => ({
  sendEmailValidation: () => dispatch(startEmailValidation.request()),
  navigateBack: () => dispatch(navigateBack()),
  updateValidationInfo: () => {
    // Refresh profile to check if the email has been validated
    dispatch(loadProfileRequest());
  },
  navigateToEmailInsertScreen: () => {
    dispatch(navigateToEmailInsertScreen());
  }
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(withLoadingSpinner(RemindEmailValidationOverlay));
