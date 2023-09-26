import { pipe } from "fp-ts/lib/function";
import * as E from "fp-ts/lib/Either";
import * as O from "fp-ts/lib/Option";
import { ThirdPartyMessageWithContent } from "../../../../../definitions/backend/ThirdPartyMessageWithContent";
import { IOReceivedNotification } from "../../../../../definitions/pn/IOReceivedNotification";
import { attachmentsFromThirdPartyMessage } from "../../../../store/reducers/entities/messages/transformers";
import { PNMessage } from "./types";

export const toPNMessage = (
  messageFromApi: ThirdPartyMessageWithContent
): O.Option<PNMessage> =>
  pipe(
    messageFromApi.third_party_message.details,
    IOReceivedNotification.decode,
    E.map(notification => ({
      ...notification,
      attachments: pipe(
        attachmentsFromThirdPartyMessage(messageFromApi, "PN"),
        O.toUndefined
      )
    })),
    O.fromEither
  );
