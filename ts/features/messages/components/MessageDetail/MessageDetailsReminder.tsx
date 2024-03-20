import React from "react";
import { VSpacer } from "@pagopa/io-app-design-system";
import { UIMessageId } from "../../types";
import { useIOSelector } from "../../../../store/hooks";
import { paymentExpirationBannerStateSelector } from "../../store/reducers/payments";
import { MessageDetailsReminderExpiring } from "./MessageDetailsReminderExpiring";
import { MessageDetailsReminderExpired } from "./MessageDetailsReminderExpired";

export type MessageDetailsReminderProps = {
  dueDate?: Date;
  messageId: UIMessageId;
  title: string;
};

export const MessageDetailsReminder = ({
  dueDate,
  messageId,
  title
}: MessageDetailsReminderProps) => {
  const reminderVisibility = useIOSelector(state =>
    paymentExpirationBannerStateSelector(state, messageId)
  );
  if (reminderVisibility === "hidden" || !dueDate) {
    return null;
  }

  const isLoading = reminderVisibility === "loading";
  const isExpiring = reminderVisibility === "visibleExpiring";

  return (
    <>
      {isExpiring ? (
        <MessageDetailsReminderExpiring
          dueDate={dueDate}
          isLoading={isLoading}
          messageId={messageId}
          title={title}
        />
      ) : (
        <MessageDetailsReminderExpired
          dueDate={dueDate}
          isLoading={isLoading}
        />
      )}
      <VSpacer size={8} />
    </>
  );
};
