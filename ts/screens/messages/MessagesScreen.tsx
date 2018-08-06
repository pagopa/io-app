import { Body, Container, Content, H1, Text, View } from "native-base";
import * as React from "react";
import {
  FlatList,
  ListRenderItemInfo,
  RefreshControl,
  RefreshControlProps
} from "react-native";
import {
  NavigationEventSubscription,
  NavigationScreenProp,
  NavigationState
} from "react-navigation";
import { connect } from "react-redux";

import MessageComponent from "../../components/messages/MessageComponent";
import ScreenHeader from "../../components/ScreenHeader";
import AppHeader from "../../components/ui/AppHeader";

import I18n from "../../i18n";

import { FetchRequestActions } from "../../store/actions/constants";
import { loadMessages } from "../../store/actions/messages";
import { ReduxProps } from "../../store/actions/types";
import { orderedMessagesSelector } from "../../store/reducers/entities/messages";
import { ServicesState } from "../../store/reducers/entities/services";
import { createLoadingSelector } from "../../store/reducers/loading";
import { GlobalState } from "../../store/reducers/types";

import variables from "../../theme/variables";

import { MessageWithContentPO } from "../../types/MessageWithContentPO";

import { DEFAULT_APPLICATION_NAME } from "../../config";

type ReduxMappedProps = Readonly<{
  isLoadingMessages: boolean;
  messages: ReadonlyArray<MessageWithContentPO>;
  services: ServicesState;
}>;

export type OwnProps = Readonly<{
  navigation: NavigationScreenProp<NavigationState>;
}>;

export type Props = ReduxMappedProps & ReduxProps & OwnProps;

/**
 * This screen show the messages to the authenticated user.
 */
class MessagesScreen extends React.Component<Props> {
  private didFocusSubscription?: NavigationEventSubscription;

  public componentDidMount() {
    this.refreshList();
  }

  public componentWillUnmount() {
    if (this.didFocusSubscription) {
      this.didFocusSubscription.remove();
      // tslint:disable-next-line no-object-mutation
      this.didFocusSubscription = undefined;
    }
  }

  private refreshList() {
    this.props.dispatch(loadMessages());
  }

  private renderItem = (info: ListRenderItemInfo<MessageWithContentPO>) => {
    return (
      <MessageComponent
        message={info.item}
        navigation={this.props.navigation}
      />
    );
  };

  private refreshControl(): React.ReactElement<RefreshControlProps> {
    return (
      <RefreshControl
        onRefresh={() => this.refreshList()}
        refreshing={this.props.isLoadingMessages}
        colors={[variables.brandPrimary]}
      />
    );
  }

  public render() {
    return (
      <Container>
        <AppHeader>
          <Body>
            <Text>{DEFAULT_APPLICATION_NAME}</Text>
          </Body>
        </AppHeader>
        <Content>
          <View>
            <ScreenHeader
              heading={<H1>{I18n.t("messages.contentTitle")}</H1>}
              icon={require("../../../img/icons/message-icon.png")}
            />
            <View spacer={true} large={true} />
            <View>
              <FlatList
                alwaysBounceVertical={false}
                scrollEnabled={true}
                data={this.props.messages}
                renderItem={this.renderItem}
                keyExtractor={message => message.id}
                refreshControl={this.refreshControl()}
              />
            </View>
          </View>
        </Content>
      </Container>
    );
  }
}

const mapStateToProps = (state: GlobalState): ReduxMappedProps => ({
  isLoadingMessages: createLoadingSelector([FetchRequestActions.MESSAGES_LOAD])(
    state
  ),
  messages: orderedMessagesSelector(state),
  services: state.entities.services
});

export default connect(mapStateToProps)(MessagesScreen);
