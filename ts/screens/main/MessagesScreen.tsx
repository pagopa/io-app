import {
  Body,
  Container,
  Content,
  H1,
  Tab,
  Tabs,
  Text,
  View
} from "native-base";
import * as React from "react";
import { FlatList } from "react-native";
import { connect } from "react-redux";
import { MessageWithContent } from "../../../definitions/backend/MessageWithContent";
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

interface IMessagesList {
  item: MessageWithContent;
  index: number;
}

/**
 * This screen show the messages to the authenticated user.
 */
class MessagesScreen extends React.Component<Props, State> {
  public renderItem = (messagesList: IMessagesList) => {
    return (
      <MessageComponent
        key={messagesList.item.id}
        date={messagesList.item.created_at}
        sender={messagesList.item.sender_service_id}
        subject={messagesList.item.subject}
      />
    );
  };

  public render() {
    const list: ReadonlyArray<MessageWithContent> = messages;

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
              <FlatList
                data={list}
                renderItem={this.renderItem}
                keyExtractor={item => item.id}
              />
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
