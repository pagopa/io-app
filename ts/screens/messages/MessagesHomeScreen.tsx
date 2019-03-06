import { none, Option, some } from "fp-ts/lib/Option";
import debounce from "lodash/debounce";
import { Icon, Input, Item, Tab, Tabs, Text, View } from "native-base";
import * as React from "react";
import { StyleSheet } from "react-native";
import { NavigationScreenProps } from "react-navigation";
import { connect } from "react-redux";

import MessagesArchive from "../../components/messages/MessagesArchive";
import MessagesDeadlines from "../../components/messages/MessagesDeadlines";
import MessagesInbox from "../../components/messages/MessagesInbox";
import MessagesSearch from "../../components/messages/MessagesSearch";
import TopScreenComponent from "../../components/screens/TopScreenComponent";
import IconFont from "../../components/ui/IconFont";
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
  searchText: Option<string>;
  debouncedSearchText: Option<string>;
};

const styles = StyleSheet.create({
  tabContainer: {
    elevation: 0,
    borderBottomWidth: 1,
    borderColor: customVariables.brandPrimary
  },
  tabBarUnderline: {
    backgroundColor: customVariables.brandPrimary
  },
  noSearchBarText: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center"
  }
});

/**
 * A screen that contains all the Tabs related to messages.
 */
class MessagesHomeScreen extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      searchText: none,
      debouncedSearchText: none
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
        hideHeader={searchText.isSome()}
        headerBody={
          searchText.isSome() ? (
            <Item>
              <Input
                placeholder={I18n.t("global.actions.search")}
                value={searchText.value}
                onChangeText={this.onSearchTextChange}
                autoFocus={true}
              />
              <Icon name="cross" onPress={this.onSearchDisable} />
            </Item>
          ) : (
            <IconFont name="io-search" onPress={this.onSearchEnable} />
          )
        }
      >
        {searchText.isSome() ? this.renderSearch() : this.renderTabs()}
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

    const { debouncedSearchText } = this.state;

    return debouncedSearchText
      .map(
        _ =>
          _.length < 3 ? (
            this.renderInvalidSearchBarText()
          ) : (
            <MessagesSearch
              messagesState={lexicallyOrderedMessagesState}
              servicesById={servicesById}
              paymentByRptId={paymentsByRptId}
              onRefresh={refreshMessages}
              navigateToMessageDetail={navigateToMessageDetail}
              searchText={_}
            />
          )
      )
      .getOrElse(this.renderInvalidSearchBarText());
  };

  private renderInvalidSearchBarText = () => {
    return (
      <View style={styles.noSearchBarText}>
        <Text>{I18n.t("messages.search.invalidSearchBarText")}</Text>
      </View>
    );
  };

  private onSearchEnable = () => {
    this.setState({
      searchText: some("")
    });
  };

  private onSearchTextChange = (text: string) => {
    this.setState({
      searchText: some(text)
    });
    this.updateDebouncedSearchText(text);
  };

  private updateDebouncedSearchText = debounce(
    (text: string) =>
      this.setState({
        debouncedSearchText: some(text)
      }),
    300
  );

  private onSearchDisable = () => {
    this.setState({
      searchText: none,
      debouncedSearchText: none
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
