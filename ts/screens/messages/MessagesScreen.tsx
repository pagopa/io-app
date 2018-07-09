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
        paymentAmount={
          messageDetails.item.payment_data != null
            ? messageDetails.item.payment_data.amount
            : null
        }
        paymentNoticeNumber={
          messageDetails.item.payment_data != null
            ? messageDetails.item.payment_data.notice_number
            : null
        }
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

const mockedMessages: any = [
  {
    created_at: "2018-06-28T09:00:06.771Z",
    id: "01CFSP4XYK3Y0VZ22HWWFKS1XM",
    markdown: "Testo da mostrare come markdown.",
    sender_service_id: "5a25abf4fcc89605c082f042c49a",
    subject: "Messaggio con informazioni di pagamento",
    payment_data: {
      amount: 55,
      notice_number: "12432237427346s52734234"
    }
  },
  {
    created_at: "2018-06-29T09:00:00.771Z",
    id: "01CFSP4XYK3Y0VZ333WWFKS1XM",
    markdown: "Testo da mostrare come markdown.",
    sender_service_id: "5a563817fcc896087002ea46c49a",
    subject: "Messaggio senza informazioni di pagamento"
  }
];

const mockedServices: any = {
  allIds: ["5a25abf4fcc89605c082f042c49a", "5a563817fcc896087002ea46c49a"],
  byId: {
    "5a25abf4fcc89605c082f042c49a": {
      department_name: "dept",
      organization_name: "agid",
      service_id: "5a25abf4fcc89605c082f042c49a",
      service_name: "service"
    },
    "5a563817fcc896087002ea46c49a": {
      department_name: "dept name: qualcosa di più lungo",
      organization_name: "Wellnet",
      service_id: "5a563817fcc896087002ea46c49a",
      service_name: "serviceName: qualcosa di più lungo"
    }
  }
};

const mapStateToProps = (state: GlobalState): ReduxMappedProps => ({
  isLoadingMessages: createLoadingSelector([FetchRequestActions.MESSAGES_LOAD])(
    state
  ),
  messages: mockedMessages,
  services: mockedServices
});

export default connect(mapStateToProps)(MessagesScreen);
