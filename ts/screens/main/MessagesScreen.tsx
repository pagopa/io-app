import { Body, Container, H1, Tab, Tabs, View } from "native-base";
import * as React from "react";
import { ActivityIndicator, FlatList } from "react-native";
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

/**
 * This screen show the messages to the authenticated user.
 *
 * TODO: Just a mocked version at the moment.
 * Going to be replaced with real content in @https://www.pivotaltracker.com/story/show/152843981
 */
class MessagesScreen extends React.Component<Props, never> {
  private didFocusSubscription?: NavigationEventSubscription;

  constructor(props: Props) {
    super(props);
  }

  public componentDidMount() {
    // TODO: Messages must be refreshed using pull-down @https://www.pivotaltracker.com/story/show/157917217
    // tslint:disable-next-line no-object-mutation
    this.didFocusSubscription = this.props.navigation.addListener(
      "didFocus",
      () => {
        this.props.dispatch(loadMessages());
      }
    );
  }

  public componentWillUnmount() {
    if (this.didFocusSubscription) {
      this.didFocusSubscription.remove();
      // tslint:disable-next-line no-object-mutation
      this.didFocusSubscription = undefined;
    }
  }

  private renderLoadingStatus = (isLoadingMessages: boolean) => {
    return isLoadingMessages ? (
      <ActivityIndicator size="small" color={variables.brandPrimary} />
    ) : null;
  };

  public getOrganizationName = (senderServiceId: string): string => {
    return this.props.services.byId[senderServiceId].organization_name;
  };

  public renderItem = (messageDetails: IMessageDetails) => {
    return (
      <MessageComponent
        key={messageDetails.item.id}
        date={messageDetails.item.created_at}
        serviceOrganizationName={this.getOrganizationName(
          messageDetails.item.sender_service_id
        )}
        subject={messageDetails.item.subject}
      />
    );
  };

  private renderMessages = (
    messages: ReadonlyArray<MessageWithContentPO>
  ): React.ReactNode => {
    return (
      <Tabs
        tabBarUnderlineStyle={{
          backgroundColor: variables.brandPrimaryLight
        }}
        initialPage={0}
      >
        <Tab heading={I18n.t("messages.tab.all")}>
          <FlatList
            alwaysBounceVertical={false}
            scrollEnabled={true}
            data={messages}
            renderItem={this.renderItem}
            keyExtractor={item => item.id}
          />
        </Tab>
        <Tab heading={I18n.t("messages.tab.deadlines")}>
          <View spacer={true} large={true} />
        </Tab>
      </Tabs>
    );
  };

  public render() {
    return (
      <Container>
        <AppHeader>
          <Body />
        </AppHeader>
        <View content={true}>
          <View spacer={true} />
          <H1>{I18n.t("messages.contentTitle")}</H1>
          {this.renderLoadingStatus(this.props.isLoadingMessages)}
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
