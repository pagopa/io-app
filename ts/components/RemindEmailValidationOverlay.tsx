/**
 * A component to remind the user to validate it email
 */

import I18n from "i18n-js";
import { Button, Content, H2, Text, View } from "native-base";
import * as React from "react";
import { Image } from "react-native";
import TopScreenComponent from "./screens/TopScreenComponent";
import FooterWithButtons from "./ui/FooterWithButtons";

export type RemindEmailValidationInterface = {
  email: string;
  validateEmail: () => void;
};

export default class RemindEmailValidationOverlay extends React.PureComponent<
  RemindEmailValidationInterface
> {
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
              /* TODO */
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
