import { Tab, Tabs } from "native-base";
import * as React from "react";
import { StyleSheet } from "react-native";
import { NavigationScreenProps } from "react-navigation";
import { connect } from "react-redux";

import MessagesArchive from "../../components/messages/MessagesArchive";
import MessagesDeadlines from "../../components/messages/MessagesDeadlines";
import MessagesInbox from "../../components/messages/MessagesInbox";
import TopScreenComponent from "../../components/screens/TopScreenComponent";
import I18n from "../../i18n";
import {
  loadMessages,
  setMessagesArchivedState
} from "../../store/actions/messages";
import { navigateToMessageDetailScreenAction } from "../../store/actions/navigation";
import { Dispatch } from "../../store/actions/types";
import { lexicallyOrderedMessagesStateInfoSelector } from "../../store/reducers/entities/messages";
import { paymentsByRptIdSelector } from "../../store/reducers/entities/payments";
import { servicesByIdSelector } from "../../store/reducers/entities/services/servicesById";
import { GlobalState } from "../../store/reducers/types";
import customVariables from "../../theme/variables";

type Props = NavigationScreenProps &
  ReturnType<typeof mapStateToProps> &
  ReturnType<typeof mapDispatchToProps>;

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
class MessagesHomeScreen extends React.Component<Props, never> {
  public componentDidMount() {
    this.props.refreshMessages();
  }

  public render() {
    const {
      lexicallyOrderedMessagesStateInfo,
      servicesById,
      paymentsByRptId,
      refreshMessages,
      navigateToMessageDetail,
      updateMessagesArchivedState
    } = this.props;

    return (
      <TopScreenComponent
        title={I18n.t("messages.contentTitle")}
        icon={require("../../../img/icons/message-icon.png")}
      >
        <Tabs
          tabContainerStyle={styles.tabContainer}
          tabBarUnderlineStyle={styles.tabBarUnderline}
          tabBarActiveTextColor={"red"}
          tabBarInactiveTextColor={"red"}
          tabBarBackgroundColor={"transparent"}
        >
          <Tab heading={I18n.t("messages.tab.inbox")}>
            <MessagesInbox
              messagesStateInfo={lexicallyOrderedMessagesStateInfo}
              servicesById={servicesById}
              paymentByRptId={paymentsByRptId}
              onRefresh={refreshMessages}
              setMessagesArchivedState={updateMessagesArchivedState}
              navigateToMessageDetail={navigateToMessageDetail}
            />
          </Tab>
          <Tab heading={I18n.t("messages.tab.deadlines")}>
            <MessagesDeadlines
              messagesStateInfo={lexicallyOrderedMessagesStateInfo}
              onRefresh={refreshMessages}
              navigateToMessageDetail={navigateToMessageDetail}
            />
          </Tab>
          <Tab heading={I18n.t("messages.tab.archive")}>
            <MessagesArchive
              messagesStateInfo={lexicallyOrderedMessagesStateInfo}
              servicesById={servicesById}
              paymentByRptId={paymentsByRptId}
              onRefresh={refreshMessages}
              setMessagesArchivedState={updateMessagesArchivedState}
              navigateToMessageDetail={navigateToMessageDetail}
            />
          </Tab>
        </Tabs>
      </TopScreenComponent>
    );
  }
}

const mapStateToProps = (state: GlobalState) => ({
  lexicallyOrderedMessagesStateInfo: lexicallyOrderedMessagesStateInfoSelector(
    state
  ),
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
