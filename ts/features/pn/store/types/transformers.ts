import { isLeft } from "fp-ts/lib/Either";
import { ThirdPartyMessage } from "../../../../../definitions/pn/ThirdPartyMessage";
import { ThirdPartyMessageWithContent } from "../../../../../definitions/backend/communication/ThirdPartyMessageWithContent";
import { PNMessage } from "./types";

export const toSENDMessage = (
  messageFromApi: ThirdPartyMessageWithContent
): PNMessage | undefined => {
  const thirdPartyMessage = messageFromApi.third_party_message;
  const sendThirdPartyMessageEither =
    ThirdPartyMessage.decode(thirdPartyMessage);
  if (isLeft(sendThirdPartyMessageEither)) {
    return undefined;
  }
  const sendThirdPartyMessageDetails =
    sendThirdPartyMessageEither.right.details;
  if (sendThirdPartyMessageDetails == null) {
    return undefined;
  }
  return {
    ...sendThirdPartyMessageDetails,
    created_at: messageFromApi.created_at,
    attachments: messageFromApi.third_party_message.attachments
  };
};
