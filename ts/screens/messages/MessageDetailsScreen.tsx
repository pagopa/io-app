import { Content } from "native-base";
import * as React from "react";
import { EventCreationResult } from "react-native-add-calendar-event";
import {
  NavigationInjectedProps,
  NavigationScreenProp,
  NavigationState
} from "react-navigation";
import { connect } from "react-redux";

import { ServicePublic } from "../../../definitions/backend/ServicePublic";
import MessageDetailsComponent from "../../components/messages/MessageDetailsComponent";
import BaseScreenComponent from "../../components/screens/BaseScreenComponent";
import I18n from "../../i18n";
import ROUTES from "../../navigation/routes";
import { ReduxProps } from "../../store/actions/types";
import { MessageWithContentPO } from "../../types/MessageWithContentPO";

export type ParamType = Readonly<{
  message: MessageWithContentPO;
  senderService: ServicePublic | undefined;
  dispatchReminderAction: (() => Promise<EventCreationResult>) | undefined;
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
class MessageDetailsScreen extends React.Component<Props, never> {
  private goBack = () => this.props.navigation.goBack();

  public render() {
    const {
      message,
      senderService,
      dispatchReminderAction,
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
            dispatchReminderAction={dispatchReminderAction}
            dispatchPaymentAction={dispatchPaymentAction}
            navigateToServicePreferences={navigateToServicePreferences}
          />
        </Content>
      </BaseScreenComponent>
    );
  }
}

export default connect()(MessageDetailsScreen);
