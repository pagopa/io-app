import { Body, Button, Container, Content, Left, Text } from "native-base";
import * as React from "react";
import {
  NavigationInjectedProps,
  NavigationScreenProp,
  NavigationState
} from "react-navigation";
import { connect } from "react-redux";

import I18n from "../../i18n";

import MessageDetailsComponent from "../../components/messages/MessageDetailsComponent";
import AppHeader from "../../components/ui/AppHeader";
import IconFont from "../../components/ui/IconFont";
import { ReduxProps } from "../../store/actions/types";

import { MessageWithContentPO } from "../../types/MessageWithContentPO";

import { ServicePublic } from "../../../definitions/backend/ServicePublic";

export type ParamType = Readonly<{
  message: MessageWithContentPO;
  senderService: ServicePublic | undefined;
  dispatchPaymentAction: (() => void) | undefined;
}>;

interface StateParams extends NavigationState {
  readonly params: ParamType;
}

type OwnProps = Readonly<{
  navigation: NavigationScreenProp<StateParams>;
}>;

type Props = ReduxProps & NavigationInjectedProps & OwnProps;

/**
 * This screen show the Message Details for a simple message
 */
export class MessageDetailsScreen extends React.Component<Props, never> {
  private goBack() {
    this.props.navigation.goBack();
  }

  public render() {
    return (
      <Container>
        <AppHeader>
          <Left>
            <Button transparent={true} onPress={_ => this.goBack()}>
              <IconFont name="io-back" />
            </Button>
          </Left>
          <Body>
            <Text>{I18n.t("messageDetails.headerTitle")}</Text>
          </Body>
        </AppHeader>
        <Content noPadded={true}>
          <MessageDetailsComponent
            message={this.props.navigation.state.params.message}
            senderService={this.props.navigation.state.params.senderService}
            dispatchPaymentAction={
              this.props.navigation.state.params.dispatchPaymentAction
            }
          />
        </Content>
      </Container>
    );
  }
}

export default connect()(MessageDetailsScreen);
