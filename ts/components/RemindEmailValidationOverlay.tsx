/**
 * A component to remind the user to validate it email
 */

import I18n from "i18n-js";
import { Button, Content, H2, Text, View } from "native-base";
import * as React from "react";
import { Image } from "react-native";
import { connect } from "react-redux";
import { navigateBack } from "../store/actions/navigation";
import { Dispatch } from "../store/actions/types";
import { GlobalState } from "../store/reducers/types";
import TopScreenComponent from "./screens/TopScreenComponent";
import FooterWithButtons from "./ui/FooterWithButtons";

// tslint:disable-next-line:no-use-before-declare
type Props = ReturnType<typeof mapDispatchToProps> &
  ReturnType<typeof mapStateToProps>;

class RemindEmailValidationOverlay extends React.PureComponent<Props> {
  public render() {
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
            <Text bold={true}>{` ${this.props.email}: `}</Text>
            {I18n.t("reminders.email.modal2")}
          </Text>
          <View spacer={true} />
          <Button
            block={true}
            light={true}
            bordered={true}
            onPress={() => {
              /* TODO */
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
              this.props.navigateBack();
            },
            title: I18n.t("reminders.email.button2")
          }}
          rightButton={{
            block: true,
            primary: true,
            onPress: this.props.validateEmail,
            title: I18n.t("global.buttons.ok")
          }}
        />
      </TopScreenComponent>
    );
  }
}

// tslint:disable-next-line: variable-name
const mapStateToProps = (_state: GlobalState) => ({
  email: "test@email.it" // TODO: get the proper email from store
});

const mapDispatchToProps = (dispatch: Dispatch) => ({
  navigateBack: () => dispatch(navigateBack()),
  validateEmail: () => undefined // TODO: add onPress of email verification https://www.pivotaltracker.com/story/show/168662501
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(RemindEmailValidationOverlay);
