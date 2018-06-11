import { Body, Container, H1, Tab, Tabs, Text, View } from "native-base";
import * as React from "react";
import {
  NavigationEventSubscription,
  NavigationScreenProp,
  NavigationState
} from "react-navigation";
import { connect } from "react-redux";

import MessageComponent from "../../components/MessageComponent";
import AppHeader from "../../components/ui/AppHeader";
import I18n from "../../i18n";
import { FetchRequestActions } from "../../store/actions/constants";
import { loadMessages } from "../../store/actions/messages";
import { ReduxProps } from "../../store/actions/types";
import { orderedMessagesSelector } from "../../store/reducers/entities/messages/index";
import { ServicesState } from "../../store/reducers/entities/services/index";
import { createLoadingSelector } from "../../store/reducers/loading";
import { GlobalState } from "../../store/reducers/types";
import variables from "../../theme/variables";
import { MessageWithContentPO } from "../../types/MessageWithContentPO";

type ReduxMappedProps = Readonly<{
  isLoadingMessages: boolean;
  messages: ReadonlyArray<MessageWithContentPO>;
  services: ServicesState;
}>;

export type OwnProps = Readonly<{
  navigation: NavigationScreenProp<NavigationState>;
}>;

export type IMessagesList = Readonly<{
  item: Readonly<MessageWithContentPO>;
  index: number;
}>;

export type Props = ReduxMappedProps & ReduxProps & OwnProps;

/**
 * This screen show the messages to the authenticated user.
 *
 * TODO: Just a mocked version at the moment.
 * Going to be replaced with real content in @https://www.pivotaltracker.com/story/show/152843981
 */
export class MessageDetailsScreen extends React.Component<Props, never> {
  render() {
    return(
      <Text> DETAILS </Text>
    )
  }
}
