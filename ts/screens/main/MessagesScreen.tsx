import { Container, Content, Text } from "native-base";
import * as React from "react";
import { ActivityIndicator } from "react-native";
import {
  NavigationEventSubscription,
  NavigationScreenProp,
  NavigationState
} from "react-navigation";
import { connect } from "react-redux";

import { MessageWithContent } from "../../../definitions/backend/MessageWithContent";
import { ReduxProps } from "../../actions/types";
import { GlobalState } from "../../reducers/types";
import { ServicesListObject } from "../../sagas/messages";
import { loadMessages } from "../../store/actions/messages";
import { orderedMessagesSelector } from "../../store/reducers/entities/messages";
import { createLoadingSelector } from "../../store/reducers/loading";

type ReduxMappedProps = {
  isLoadingMessages: boolean;
  messages: ReadonlyArray<MessageWithContent>;
  servicesById: ServicesListObject;
};

export type OwnProps = {
  navigation: NavigationScreenProp<NavigationState>;
};

export type Props = ReduxMappedProps & ReduxProps & OwnProps;

/**
 * This screen show the messages to the authenticated user.
 */
class MessagesScreen extends React.Component<Props, never> {
  private didFocusSubscription:
    | NavigationEventSubscription
    | undefined = undefined;

  constructor(props: Props) {
    super(props);
  }

  public componentDidMount() {
    // tslint:disable-next-line
    this.didFocusSubscription = this.props.navigation.addListener(
      "didFocus",
      () => {
        this.loadMessages();
      }
    );
  }

  public componentWillUnmount() {
    if (this.didFocusSubscription) {
      this.didFocusSubscription.remove();
    }
  }

  private renderLoadingStatus = (isLoadingMessages: boolean) => {
    return isLoadingMessages ? (
      <ActivityIndicator size="small" color="#00ff00" />
    ) : null;
  };

  public render() {
    return (
      <Container>
        <Content>
          {this.renderLoadingStatus(this.props.isLoadingMessages)}
          <Text>You have {this.props.messages.length} messages</Text>
        </Content>
      </Container>
    );
  }

  private loadMessages() {
    this.props.dispatch(loadMessages());
  }
}

const mapStateToProps = (state: GlobalState): ReduxMappedProps => ({
  isLoadingMessages: createLoadingSelector(["MESSAGES_LOAD"])(state),
  messages: orderedMessagesSelector(state),
  servicesById: state.entities.services.byId
});

export default connect(mapStateToProps)(MessagesScreen);
