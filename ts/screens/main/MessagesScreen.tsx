import {
  Body,
  Container,
  Content,
  H1,
  List,
  Tab,
  Tabs,
  Text,
  View
} from "native-base";
import * as React from "react";
import { connect } from "react-redux";
import { CreatedMessageWithContent } from "../../../definitions/backend/CreatedMessageWithContent";
import { ReduxProps } from "../../actions/types";
import messages from "../../api/mock/messages.json";
import MessageComponent from "../../components/MessageComponent";
import AppHeader from "../../components/ui/AppHeader";
import I18n from "../../i18n";
import variables from "../../theme/variables";

type ReduxMappedProps = {};
export type OwnProps = {};
type Props = ReduxMappedProps & ReduxProps & OwnProps;
type State = {};
type ListOfCreatedMessageWithContentInterface = {
  [id: string]: CreatedMessageWithContent;
};

/**
 * This screen show the messages to the authenticated user.
 */
class MessagesScreen extends React.Component<Props, State> {
  public renderMessageList = (
    list: ListOfCreatedMessageWithContentInterface
  ) => {
    return Object.keys(list).map(key => {
      return (
        <MessageComponent
          key={key}
          sender={list[key].sender_service_id}
          subject={list[key].content.subject}
          date={list[key].created_at}
        />
      );
    });
  };

  public render() {
    const messagesById: ListOfCreatedMessageWithContentInterface =
      messages.byId;
    return (
      <Container>
        <AppHeader>
          <Body>
            <Text>{I18n.t("messages.headerTitle")}</Text>
          </Body>
        </AppHeader>
        <Content>
          <View spacer={true} />
          <H1>{I18n.t("messages.contentTitle")}</H1>
          <Tabs
            tabBarUnderlineStyle={{
              backgroundColor: variables.brandDarkenBlue
            }}
            initialPage={0}
          >
            <Tab heading={I18n.t("tabMessages.itemAll")}>
              <View spacer={true} large={true} />
              <List>{this.renderMessageList(messagesById)}</List>
            </Tab>
            <Tab heading={I18n.t("tabMessages.itemDeadlines")}>
              <View spacer={true} large={true} />
            </Tab>
          </Tabs>
        </Content>
      </Container>
    );
  }
}

export default connect()(MessagesScreen);
