import * as React from "react";
import { RouteProp, useRoute } from "@react-navigation/native";
import * as pot from "@pagopa/ts-commons/lib/pot";
import { pipe } from "fp-ts/lib/function";
import * as O from "fp-ts/lib/Option";
import { useMessageOpening } from "../hooks/useMessageOpening";
import MessagesInbox from "../components/MessagesInbox";
import { upsertMessageStatusAttributes } from "../store/actions";
import { useIODispatch, useIOSelector } from "../../../store/hooks";
import {
  MessagePagePot,
  messagesByCategorySelector
} from "../store/reducers/allPaginated";
import { UIMessage } from "../types";
import { MessagesHomeTabParamsList } from "../navigation/MessagesHomeTabNavigator";
import MessagesArchive from "../components/MessagesArchive";
import messageListData, {
  MessageListCategory
} from "../types/messageListCategory";

export type MessagesHomeTabNavigationParams = Readonly<{
  category: MessageListCategory;
}>;

type MessageListScreenRouteProps = RouteProp<
  MessagesHomeTabParamsList,
  "MESSAGES_INBOX" | "MESSAGES_ARCHIVE"
>;

// it's not managed in the selector
// because pot.map generates a new instance
// every time causing a re-render
const getMessages = (messagePagePot: MessagePagePot) =>
  pot.getOrElse(
    pot.map(messagePagePot, _ => _.page),
    []
  );

const MessageListScreen = () => {
  const route = useRoute<MessageListScreenRouteProps>();
  const dispatch = useIODispatch();
  const messagePagePot = useIOSelector(state =>
    messagesByCategorySelector(state, route.params.category)
  );
  const messages = getMessages(messagePagePot);
  const { present, bottomSheet } = useMessageOpening();

  const setArchived = (
    isArchived: boolean,
    messages: ReadonlyArray<UIMessage>
  ) =>
    messages.forEach(message =>
      dispatch(
        upsertMessageStatusAttributes.request({
          message,
          update: { tag: "archiving", isArchived }
        })
      )
    );

  const getContent = (category: MessageListCategory) =>
    messageListData.fold(
      category,
      () => (
        <MessagesInbox
          messages={messages}
          navigateToMessageDetail={present}
          archiveMessages={messages => setArchived(true, messages)}
        />
      ),
      () => (
        <MessagesArchive
          messages={messages}
          navigateToMessageDetail={present}
          unarchiveMessages={messages => setArchived(false, messages)}
        />
      )
    );

  return (
    <>
      {pipe(route.params.category, O.of, O.map(getContent), O.toUndefined)}
      {bottomSheet}
    </>
  );
};

export default MessageListScreen;
