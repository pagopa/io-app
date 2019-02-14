import { Tab, Tabs } from "native-base";
import * as React from "react";
import { StyleSheet } from "react-native";
import { NavigationScreenProps } from "react-navigation";
import { connect } from "react-redux";

import MessagesArchive from "../../components/messages/MessagesArchive";
import MessagesInbox from "../../components/messages/MessagesInbox";
import TopScreenComponent from "../../components/screens/TopScreenComponent";
import I18n from "../../i18n";
import {
  loadMessages,
  setMessagesArchivedState
} from "../../store/actions/messages";
import { navigateToMessageDetailScreenAction } from "../../store/actions/navigation";
import { ReduxProps } from "../../store/actions/types";
import { lexicallyOrderedMessagesStateInfoSelector } from "../../store/reducers/entities/messages";
import { paymentsByRptIdSelector } from "../../store/reducers/entities/payments";
import { servicesByIdSelector } from "../../store/reducers/entities/services/servicesById";
import { GlobalState } from "../../store/reducers/types";
import customVariables from "../../theme/variables";

type Props = NavigationScreenProps &
  ReturnType<typeof mapStateToProps> &
  ReduxProps;

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
    this.refreshMessages();
  }

  public render() {
    const {
      lexicallyOrderedMessagesStateInfo,
      servicesById,
      paymentsByRptId
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
              onRefresh={this.refreshMessages}
              setMessagesArchivedState={this.setMessagesArchivedState}
              navigateToMessageDetail={this.navigateToMessageDetail}
            />
          </Tab>
          <Tab heading={I18n.t("messages.tab.archive")}>
            <MessagesArchive
              messagesStateInfo={lexicallyOrderedMessagesStateInfo}
              servicesById={servicesById}
              paymentByRptId={paymentsByRptId}
              onRefresh={this.refreshMessages}
              setMessagesArchivedState={this.setMessagesArchivedState}
              navigateToMessageDetail={this.navigateToMessageDetail}
            />
          </Tab>
        </Tabs>
      </TopScreenComponent>
    );
  }

  private refreshMessages = () => this.props.dispatch(loadMessages.request());

  private navigateToMessageDetail = (messageId: string) => {
    this.props.dispatch(navigateToMessageDetailScreenAction({ messageId }));
  };

  private setMessagesArchivedState = (
    ids: ReadonlyArray<string>,
    archived: boolean
  ) => this.props.dispatch(setMessagesArchivedState(ids, archived));
}

const mapStateToProps = (state: GlobalState) => ({
  lexicallyOrderedMessagesStateInfo: lexicallyOrderedMessagesStateInfoSelector(
    state
  ),
  servicesById: servicesByIdSelector(state),
  paymentsByRptId: paymentsByRptIdSelector(state)
});

export default connect(mapStateToProps)(MessagesHomeScreen);
