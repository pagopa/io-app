import { Body, Button, Icon, Container, Content, H1, Left, Tab, Tabs, Text, View } from "native-base";
import * as React from "react";
import {
  NavigationEventSubscription,
  NavigationScreenProp,
  NavigationState
} from "react-navigation";

import AppHeader from "../../components/ui/AppHeader";
import I18n from "../../i18n";

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

  private goBack() {
    this.props.navigation.goBack();
  }

  render() {
    return(
      <Container>
       <Content>
         <AppHeader>
           <Left>
             <Button transparent={true} onPress={_ => this.goBack()}>
               <Icon name="chevron-left" />
             </Button>
           </Left>
           <Body>
           <Text>{I18n.t("onboarding.tos.headerTitle")}</Text>
           </Body>
         </AppHeader>
       </Content>
      </Container>
    )
  }
}
