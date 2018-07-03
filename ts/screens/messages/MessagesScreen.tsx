import { Container, H1, Tab, Tabs, View } from "native-base";
import * as React from "react";
import {
  FlatList,
  RefreshControl,
  RefreshControlProps,
  StyleSheet
} from "react-native";
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

type ReduxMappedProps = Readonly<{
  isLoadingMessages: boolean;
  messages: ReadonlyArray<MessageWithContentPO>;
  services: ServicesState;
}>;

export type OwnProps = Readonly<{
  navigation: NavigationScreenProp<NavigationState>;
}>;

export type IMessageDetails = Readonly<{
  item: Readonly<MessageWithContentPO>;
  index: number;
}>;

export type Props = ReduxMappedProps & ReduxProps & OwnProps;

const styles = StyleSheet.create({
  tabBarUnderlineStyle: {
    width: 0
  },
  activeTabStyle: {
    borderBottomWidth: 2,
    borderBottomColor: variables.brandPrimaryLight
  },
  notActiveTabStyle: {
    borderBottomWidth: 0,
    borderBottomColor: variables.brandPrimaryInverted
  }
});

/**
 * This screen show the messages to the authenticated user.
 */
class MessagesScreen extends React.Component<Props, never> {
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

  private getServiceName = (senderServiceId: string): string => {
    return this.props.services.byId[senderServiceId].service_name;
  };

  private getOrganizationName = (senderServiceId: string): string => {
    return this.props.services.byId[senderServiceId].organization_name;
  };

  private getDepartmentName = (senderServiceId: string): string => {
    return this.props.services.byId[senderServiceId].department_name;
  };

  private refreshList() {
    this.props.dispatch(loadMessages());
  }

  public renderItem = (messageDetails: IMessageDetails) => {
    return (
      <MessageComponent
        id={messageDetails.item.id}
        createdAt={messageDetails.item.created_at}
        serviceOrganizationName={this.getOrganizationName(
          messageDetails.item.sender_service_id
        )}
        serviceDepartmentName={this.getDepartmentName(
          messageDetails.item.sender_service_id
        )}
        subject={messageDetails.item.subject}
        navigation={this.props.navigation}
        senderServiceId={messageDetails.item.sender_service_id}
        markdown={messageDetails.item.markdown}
        serviceName={this.getServiceName(messageDetails.item.sender_service_id)}
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

  private renderMessages = (
    messages: ReadonlyArray<MessageWithContentPO>
  ): React.ReactNode => {
    return (
      <Tabs
        tabBarUnderlineStyle={styles.tabBarUnderlineStyle}
        initialPage={0}
        locked={true}
      >
        <Tab
          heading={I18n.t("messages.tab.all")}
          activeTabStyle={styles.activeTabStyle}
        >
          <FlatList
            alwaysBounceVertical={false}
            scrollEnabled={true}
            data={messages}
            renderItem={this.renderItem}
            keyExtractor={item => item.id}
            refreshControl={this.refreshControl()}
          />
        </Tab>
        <Tab
          heading={I18n.t("messages.tab.deadlines")}
          activeTabStyle={styles.activeTabStyle}
        >
          <View spacer={true} large={true} />
        </Tab>
        <Tab heading={""} activeTabStyle={styles.notActiveTabStyle}>
          <View spacer={true} large={true} />
        </Tab>
        <Tab heading={" "} activeTabStyle={styles.notActiveTabStyle}>
          <View spacer={true} large={true} />
        </Tab>
      </Tabs>
    );
  };

  public render() {
    return (
      <Container>
        <View content={true}>
          <View spacer={true} />
          <H1>{I18n.t("messages.contentTitle")}</H1>
          {this.renderMessages(this.props.messages)}
        </View>
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
