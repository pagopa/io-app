import { Body, Container, H1, Tab, Tabs, Text, View } from "native-base";
import * as React from "react";
import { ActivityIndicator, FlatList } from "react-native";
import {
  NavigationEventSubscription,
  NavigationScreenProp,
  NavigationState
} from "react-navigation";
import { connect } from "react-redux";
import { ReduxProps } from "../../actions/types";
import MessageComponent from "../../components/MessageComponent";
import AppHeader from "../../components/ui/AppHeader";
import I18n from "../../i18n";
import { GlobalState } from "../../reducers/types";
import { FetchRequestActions } from "../../store/actions/constants";
import { loadMessages } from "../../store/actions/messages";
import { orderedMessagesSelector } from "../../store/reducers/entities/messages";
import { ServicesState } from "../../store/reducers/entities/services";
import { createLoadingSelector } from "../../store/reducers/loading";
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

interface IMessagesList {
  item: MessageWithContentPO;
  index: number;
}

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

  public renderItem = (messagesList: IMessagesList) => {
    return (
      <MessageComponent
        key={messagesList.item.id}
        date={messagesList.item.created_at}
        services={this.props.services}
        sender={messagesList.item.sender_service_id}
        subject={messagesList.item.subject}
      />
    );
  };

  private renderMockedMessages = (
    messages: ReadonlyArray<MessageWithContentPO>
  ): React.ReactNode => {
    return (
      <Tabs
        tabBarUnderlineStyle={{
          backgroundColor: variables.brandDarkenBlue
        }}
        initialPage={0}
      >
        <Tab heading={I18n.t("tabMessages.itemAll")}>
          <FlatList
            alwaysBounceVertical={false}
            scrollEnabled={true}
            data={messages}
            renderItem={this.renderItem}
            keyExtractor={item => item.id}
          />
        </Tab>
        <Tab heading={I18n.t("tabMessages.itemDeadlines")}>
          <View spacer={true} large={true} />
        </Tab>
      </Tabs>
    );
  };

  public render() {
    return (
      <Container>
        <AppHeader>
          <Body>
            <Text>{I18n.t("messages.headerTitle")}</Text>
          </Body>
        </AppHeader>
        <View content={true}>
          <View spacer={true} />
          <H1>{I18n.t("messages.contentTitle")}</H1>
          {this.renderLoadingStatus(this.props.isLoadingMessages)}
          {this.renderMockedMessages(this.props.messages)}
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
