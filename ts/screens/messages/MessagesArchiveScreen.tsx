import * as React from "react";
import { useMessageOpening } from "../../components/messages/hooks/useMessageOpening";
import MessagesArchive from "../../components/messages/MessagesArchive";
import { upsertMessageStatusAttributes } from "../../store/actions/messages";
import { useIODispatch, useIOSelector } from "../../store/hooks";
import { allArchiveMessagesSelector } from "../../store/reducers/entities/messages/allPaginated";
import { UIMessage } from "../../store/reducers/entities/messages/types";

const MessagesArchiveScreen = () => {
  const archive = useIOSelector(allArchiveMessagesSelector);
  const { openMessage, bottomSheet } = useMessageOpening();

  const dispatch = useIODispatch();

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

  return (
    <>
      <MessagesArchive
        messages={archive}
        navigateToMessageDetail={openMessage}
        unarchiveMessages={messages => setArchived(false, messages)}
      />
      {bottomSheet}
    </>
  );
};

export default MessagesArchiveScreen;
