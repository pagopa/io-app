import { ThirdPartyMessageWithContent } from "../../../../../definitions/backend/ThirdPartyMessageWithContent";
import { PNMessage, FullReceivedNotification } from "./types";

export const toPNMessage = (
  messageFromApi: ThirdPartyMessageWithContent
): PNMessage | undefined => {
  const maybeNotification = FullReceivedNotification.decode(
    messageFromApi.third_party_message.details
  );

  if (maybeNotification.isRight()) {
    return {
      ...maybeNotification.value,
      serviceId: messageFromApi.sender_service_id,
      attachments: undefined
    };
  }
  return undefined;
};
