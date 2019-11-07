/**
 * A component to remind the user to validate his/her email
 */
import I18n from "i18n-js";
import * as pot from "italia-ts-commons/lib/pot";
import { untag } from "italia-ts-commons/lib/types";
import { Button, Content, H2, Text, View } from "native-base";
import * as React from "react";
import { Alert, Image } from "react-native";
import { connect } from "react-redux";
import { setDebugModeEnabled } from "../store/actions/debug";
import {
  navigateBack,
  navigateToEmailInsertScreen
} from "../store/actions/navigation";
import { Dispatch } from "../store/actions/types";
import { GlobalState } from "../store/reducers/types";
import TopScreenComponent from "./screens/TopScreenComponent";
import FooterWithButtons from "./ui/FooterWithButtons";

// tslint:disable-next-line:no-use-before-declare
type Props = ReturnType<typeof mapDispatchToProps> &
  ReturnType<typeof mapStateToProps>;

type State = {
  dispatched: boolean;
};

class RemindEmailValidationOverlay extends React.PureComponent<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      dispatched: false
    };
  }
  public componentDidUpdate(prevprops: Props, prevstate: State) {
    const { isValidEmail } = this.props;
    const { dispatched } = this.state;
    if (
      !prevprops.isValidEmail &&
      !isValidEmail &&
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
  }

  public render() {
    const { optionProfile } = this.props;
    const profileEmail = optionProfile
      .map(_ => untag(_.spid_email))
      .getOrElse("");
    return (
      <TopScreenComponent appLogo={true}>
        <Content>
          <Image
            style={{ alignSelf: "center" }}
            source={require("../../img/email-checked-icon.png")}
          />
          <View spacer={true} extralarge={true} />
          <H2 style={{ textAlign: "center" }}>
            {I18n.t("reminders.email.title")}
          </H2>
          <View spacer={true} />
          <Text>
            {I18n.t("reminders.email.modal1")}
            <Text bold={true}>{` ${profileEmail}: `}</Text>
            {I18n.t("reminders.email.modal2")}
          </Text>
          <View spacer={true} />
          <Button
            block={true}
            light={true}
            bordered={true}
            onPress={() => {
              // https://www.pivotaltracker.com/story/show/168247365
              Alert.alert(I18n.t("global.notImplemented"));
            }}
          >
            <Text>{I18n.t("reminders.email.button1")}</Text>
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
            onPress: () => {
              this.setState(
                {
                  dispatched: true
                },
                this.props.validateEmail
              );
            },
            title: I18n.t("global.buttons.ok")
          }}
        />
      </TopScreenComponent>
    );
  }
}

// tslint:disable-next-line: variable-name
const mapStateToProps = (state: GlobalState) => ({
  optionProfile: pot.toOption(state.profile),
  isValidEmail: !state.debug.isDebugModeEnabled // TODO: get the proper isValidEmail from store
});

const mapDispatchToProps = (dispatch: Dispatch) => ({
  navigateBack: () => dispatch(navigateBack()),
  validateEmail: () => dispatch(setDebugModeEnabled(false)), // TODO: add onPress of email verification https://www.pivotaltracker.com/story/show/168662501
  navigateToEmailInsertScreen: () => {
    dispatch(navigateToEmailInsertScreen({ isFromProfileSection: false }));
  }
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(RemindEmailValidationOverlay);
