import { none, Option, some } from "fp-ts/lib/Option";
import * as pot from "italia-ts-commons/lib/pot";
import debounce from "lodash/debounce";
import {
  Button,
  DefaultTabBar,
  Icon,
  Input,
  Item,
  Tab,
  Tabs,
  Text,
  View
} from "native-base";
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
  setMessagesArchivedState,
  setNumberMessagesUnread
} from "../../store/actions/messages";
import { navigateToMessageDetailScreenAction } from "../../store/actions/navigation";
import { Dispatch } from "../../store/actions/types";
import { lexicallyOrderedMessagesStateSelector } from "../../store/reducers/entities/messages";
import { MessageState } from "../../store/reducers/entities/messages/messagesById";
import { paymentsByRptIdSelector } from "../../store/reducers/entities/payments";
import { servicesByIdSelector } from "../../store/reducers/entities/services/servicesById";
import { GlobalState } from "../../store/reducers/types";
import customVariables from "../../theme/variables";

// Used to disable the Deadlines tab
const DEADLINES_TAB_ENABLED = false;
// tslint:disable-next-line:no-let
let badgeNumber = 0;
type Props = NavigationScreenProps &
  ReturnType<typeof mapStateToProps> &
  ReturnType<typeof mapDispatchToProps>;

type State = {
  searchText: Option<string>;
  debouncedSearchText: Option<string>;
};

const styles = StyleSheet.create({
  tabContainerStyle: {
    elevation: 0
  },
  noSearchBarText: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center"
  },
  shadowContainer: {
    backgroundColor: "#FFFFFF",
    paddingHorizontal: customVariables.contentPadding
  },
  shadow: {
    width: "100%",
    height: 1,
    borderBottomWidth: 1,
    borderBottomColor: customVariables.brandGray,
    // iOS shadow
    shadowColor: customVariables.footerShadowColor,
    shadowOffset: {
      width: 0,
      height: 2
    },
    shadowRadius: 5,
    shadowOpacity: 1,
    // Android shadow
    elevation: 5
  },
  ioSearch: {
    // Corrects the position of the font icon inside the button
    paddingHorizontal: 2
  }
});

const renderTabBar = (props: any) => {
  return (
    <React.Fragment>
      <DefaultTabBar {...props} />
      <View style={styles.shadowContainer}>
        <View style={styles.shadow} />
      </View>
    </React.Fragment>
  );
};

/**
 * Filter only the messages that are unreaded.
 */
const generateMessagesStateUnreadedArray = (
  potMessagesState: pot.Pot<ReadonlyArray<MessageState>, string>
): ReadonlyArray<MessageState> =>
  pot.getOrElse(
    pot.map(potMessagesState, _ =>
      _.filter(messageState => !messageState.isRead)
    ),
    []
  );
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

  public componentDidUpdate(prevProps: Props) {
    const badgeNumberPrev = generateMessagesStateUnreadedArray(
      prevProps.lexicallyOrderedMessagesState
    ).filter(obj => !obj.isRead).length;
    badgeNumber = generateMessagesStateUnreadedArray(
      this.props.lexicallyOrderedMessagesState
    ).filter(obj => !obj.isRead).length;

    if (badgeNumberPrev !== badgeNumber) {
      this.props.updateBadgeNumber(badgeNumber);
    }
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
            <Button
              onPress={this.onSearchEnable}
              transparent={true}
              style={styles.ioSearch}
            >
              <IconFont name="io-search" />
            </Button>
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
        renderTabBar={renderTabBar}
        tabContainerStyle={styles.tabContainerStyle}
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
        {DEADLINES_TAB_ENABLED && (
          <Tab heading={I18n.t("messages.tab.deadlines")}>
            <MessagesDeadlines
              messagesState={lexicallyOrderedMessagesState}
              onRefresh={refreshMessages}
              navigateToMessageDetail={navigateToMessageDetail}
            />
          </Tab>
        )}

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
        <Text>{I18n.t("global.search.invalidSearchBarText")}</Text>
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
  refreshMessages: () => {
    dispatch(loadMessages.request());
  },
  navigateToMessageDetail: (messageId: string) =>
    dispatch(navigateToMessageDetailScreenAction({ messageId, badgeNumber })),
  updateMessagesArchivedState: (
    ids: ReadonlyArray<string>,
    archived: boolean
  ) => dispatch(setMessagesArchivedState(ids, archived)),
  updateBadgeNumber: (messagesUnread: number) =>
    dispatch(setNumberMessagesUnread(messagesUnread))
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(MessagesHomeScreen);
