import * as React from "react";
import { FlatList, ListRenderItemInfo, RefreshControl } from "react-native";
import {
  NavigationEventSubscription,
  NavigationScreenProp,
  NavigationState
} from "react-navigation";
import { connect } from "react-redux";

import MessageComponent from "../../components/messages/MessageComponent";

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

import TopScreenComponent from "../../components/screens/TopScreenComponent";

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

  private refreshList = () => this.props.dispatch(loadMessages());

  private renderItem = (info: ListRenderItemInfo<MessageWithContentPO>) => {
    return (
      <MessageComponent
        message={info.item}
        navigation={this.props.navigation}
      />
    );
  };

  private refreshControl = (
    <RefreshControl
      onRefresh={this.refreshList}
      refreshing={this.props.isLoadingMessages}
      colors={[variables.brandPrimary]}
      title={I18n.t("messages.refresh")}
    />
  );

  public keyExtractor = ({ id }: MessageWithContentPO) => id;

  public render() {
    return (
      <TopScreenComponent
        title={I18n.t("messages.contentTitle")}
        icon={require("../../../img/icons/message-icon.png")}
      >
        <FlatList
          scrollEnabled={true}
          data={this.props.messages}
          renderItem={this.renderItem}
          keyExtractor={this.keyExtractor}
          refreshControl={this.refreshControl}
        />
      </TopScreenComponent>
    );
  }
}

const loadingMessagesSelector = createLoadingSelector([
  FetchRequestActions.MESSAGES_LOAD
]);

const mapStateToProps = (state: GlobalState): ReduxMappedProps => ({
  isLoadingMessages: loadingMessagesSelector(state),
  messages: orderedMessagesSelector(state),
  services: state.entities.services
});

export default connect(mapStateToProps)(MessagesScreen);
