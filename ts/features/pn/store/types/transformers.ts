import * as E from "fp-ts/lib/Either";
import { ThirdPartyMessageWithContent } from "../../../../../definitions/backend/ThirdPartyMessageWithContent";
import { attachmentsFromThirdPartyMessage } from "../../../../store/reducers/entities/messages/transformers";
import { PNMessage, FullReceivedNotification } from "./types";

export const toPNMessage = (
  messageFromApi: ThirdPartyMessageWithContent
): PNMessage | undefined => {
  const maybeNotification = FullReceivedNotification.decode(
    messageFromApi.third_party_message.details
  );

  if (E.isRight(maybeNotification)) {
    return {
      ...maybeNotification.right,
      serviceId: messageFromApi.sender_service_id,
      attachments: attachmentsFromThirdPartyMessage(messageFromApi, "PN")
    };
  }
  return undefined;
};
