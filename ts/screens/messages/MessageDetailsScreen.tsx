import { Content } from "native-base";
import * as React from "react";
import {
  NavigationInjectedProps,
  NavigationScreenProp,
  NavigationState
} from "react-navigation";
import { connect } from "react-redux";

import I18n from "../../i18n";

import MessageDetailsComponent from "../../components/messages/MessageDetailsComponent";
import BaseScreenComponent from "../../components/screens/BaseScreenComponent";
import { ReduxProps } from "../../store/actions/types";

import { MessageWithContentPO } from "../../types/MessageWithContentPO";

import { ServicePublic } from "../../../definitions/backend/ServicePublic";
import ROUTES from "../../navigation/routes";

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
  private goBack = () => this.props.navigation.goBack();

  public render() {
    const {
      message,
      senderService,
      dispatchPaymentAction
    } = this.props.navigation.state.params;

    // triggers navigation to the service page
    const navigateToServicePreferences = senderService
      ? () =>
          this.props.navigation.navigate(ROUTES.PREFERENCES_SERVICE_DETAIL, {
            service: senderService
          })
      : undefined;

    return (
      <BaseScreenComponent
        headerTitle={I18n.t("messageDetails.headerTitle")}
        goBack={this.goBack}
      >
        <Content noPadded={true}>
          <MessageDetailsComponent
            message={message}
            senderService={senderService}
            dispatchPaymentAction={dispatchPaymentAction}
            navigateToServicePreferences={navigateToServicePreferences}
          />
        </Content>
      </BaseScreenComponent>
    );
  }
}

export default connect()(MessageDetailsScreen);
