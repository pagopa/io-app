import { Container } from "native-base";
import * as React from "react";
import {
  NavigationEventSubscription,
  NavigationScreenProp,
  NavigationState
} from "react-navigation";
import { connect } from "react-redux";

import { ReduxProps } from "../../actions/types";
import { loadMessages } from "../../store/actions/messages";

export type OwnProps = {
  navigation: NavigationScreenProp<NavigationState>;
};

export type Props = ReduxProps & OwnProps;

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

  public render() {
    return <Container />;
  }

  private loadMessages() {
    this.props.dispatch(loadMessages());
  }
}

export default connect()(MessagesScreen);
