import { ThirdPartyMessageWithContent } from "@io-app/api-types/generated/definitions/communication/ThirdPartyMessageWithContent";
import { ThirdPartyMessage } from "@io-app/api-types/generated/definitions/pn/ThirdPartyMessage";
import { isLeft } from "fp-ts/lib/Either";

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
