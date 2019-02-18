import { Icon, Input, Item, Tab, Tabs } from "native-base";
import * as React from "react";
import { StyleSheet } from "react-native";
import { NavigationScreenProps } from "react-navigation";
import { connect } from "react-redux";

import MessagesArchive from "../../components/messages/MessagesArchive";
import MessagesDeadlines from "../../components/messages/MessagesDeadlines";
import MessagesInbox from "../../components/messages/MessagesInbox";
import MessagesSearch from "../../components/messages/MessagesSearch";
import TopScreenComponent from "../../components/screens/TopScreenComponent";
import I18n from "../../i18n";
import {
  loadMessages,
  setMessagesArchivedState
} from "../../store/actions/messages";
import { navigateToMessageDetailScreenAction } from "../../store/actions/navigation";
import { Dispatch } from "../../store/actions/types";
import { lexicallyOrderedMessagesStateSelector } from "../../store/reducers/entities/messages";
import { paymentsByRptIdSelector } from "../../store/reducers/entities/payments";
import { servicesByIdSelector } from "../../store/reducers/entities/services/servicesById";
import { GlobalState } from "../../store/reducers/types";
import customVariables from "../../theme/variables";

type Props = NavigationScreenProps &
  ReturnType<typeof mapStateToProps> &
  ReturnType<typeof mapDispatchToProps>;

type State = {
  searchText: string;
};

const styles = StyleSheet.create({
  tabContainer: {
    elevation: 0,
    borderBottomWidth: 1,
    borderColor: customVariables.brandPrimary
  },
  tabBarUnderline: {
    backgroundColor: customVariables.brandPrimary
  }
});

/**
 * A screen that contains all the Tabs related to messages.
 */
class MessagesHomeScreen extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      searchText: ""
    };
  }

  public componentDidMount() {
    this.props.refreshMessages();
  }

  public render() {
    const { searchText } = this.state;

    return (
      <TopScreenComponent
        title={I18n.t("messages.contentTitle")}
        icon={require("../../../img/icons/message-icon.png")}
        headerBody={
          <Item>
            <Icon name="magnifying-glass" />
            <Input
              placeholder="Search"
              value={searchText}
              onChangeText={this.onSearchTextChange}
            />
            <Icon name="cross" onPress={this.onSearchTextReset} />
          </Item>
        }
      >
        {searchText === "" ? this.renderTabs() : this.renderSearch()}
      </TopScreenComponent>
    );
  }

  /**
   * Render Inbox, Deadlines and Archive tabs.
   */
  private renderTabs = () => {
    const {
      lexicallyOrderedMessagesState,
      servicesById,
      paymentsByRptId,
      refreshMessages,
      navigateToMessageDetail,
      updateMessagesArchivedState
    } = this.props;

    return (
      <Tabs
        tabContainerStyle={styles.tabContainer}
        tabBarUnderlineStyle={styles.tabBarUnderline}
        tabBarActiveTextColor={"red"}
        tabBarInactiveTextColor={"red"}
        tabBarBackgroundColor={"transparent"}
      >
        <Tab heading={I18n.t("messages.tab.inbox")}>
          <MessagesInbox
            messagesState={lexicallyOrderedMessagesState}
            servicesById={servicesById}
            paymentByRptId={paymentsByRptId}
            onRefresh={refreshMessages}
            setMessagesArchivedState={updateMessagesArchivedState}
            navigateToMessageDetail={navigateToMessageDetail}
          />
        </Tab>
        <Tab heading={I18n.t("messages.tab.deadlines")}>
          <MessagesDeadlines
            messagesState={lexicallyOrderedMessagesState}
            onRefresh={refreshMessages}
            navigateToMessageDetail={navigateToMessageDetail}
          />
        </Tab>
        <Tab heading={I18n.t("messages.tab.archive")}>
          <MessagesArchive
            messagesState={lexicallyOrderedMessagesState}
            servicesById={servicesById}
            paymentByRptId={paymentsByRptId}
            onRefresh={refreshMessages}
            setMessagesArchivedState={updateMessagesArchivedState}
            navigateToMessageDetail={navigateToMessageDetail}
          />
        </Tab>
      </Tabs>
    );
  };

  /**
   * Render MessageSearch component.
   */
  private renderSearch = () => {
    const {
      lexicallyOrderedMessagesState,
      servicesById,
      paymentsByRptId,
      refreshMessages,
      navigateToMessageDetail
    } = this.props;

    const { searchText } = this.state;

    return (
      <MessagesSearch
        messagesState={lexicallyOrderedMessagesState}
        servicesById={servicesById}
        paymentByRptId={paymentsByRptId}
        onRefresh={refreshMessages}
        navigateToMessageDetail={navigateToMessageDetail}
        searchText={searchText}
      />
    );
  };

  private onSearchTextChange = (text: string) => {
    this.setState({
      searchText: text
    });
  };

  private onSearchTextReset = () => {
    this.setState({
      searchText: ""
    });
  };
}

const mapStateToProps = (state: GlobalState) => ({
  lexicallyOrderedMessagesState: lexicallyOrderedMessagesStateSelector(state),
  servicesById: servicesByIdSelector(state),
  paymentsByRptId: paymentsByRptIdSelector(state)
});

const mapDispatchToProps = (dispatch: Dispatch) => ({
  refreshMessages: () => dispatch(loadMessages.request()),
  navigateToMessageDetail: (messageId: string) =>
    dispatch(navigateToMessageDetailScreenAction({ messageId })),
  updateMessagesArchivedState: (
    ids: ReadonlyArray<string>,
    archived: boolean
  ) => dispatch(setMessagesArchivedState(ids, archived))
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(MessagesHomeScreen);
