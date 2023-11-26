import { pipe } from "fp-ts/lib/function";
import * as O from "fp-ts/lib/Option";
import { ThirdPartyMessageWithContent } from "../../../../../definitions/backend/ThirdPartyMessageWithContent";
import { ThirdPartyMessage } from "../../../../../definitions/pn/ThirdPartyMessage";
import { attachmentsFromThirdPartyMessage } from "../../../../store/reducers/entities/messages/transformers";
import { PNMessage } from "./types";

export const toPNMessage = (
  messageFromApi: ThirdPartyMessageWithContent
): O.Option<PNMessage> =>
  pipe(
    messageFromApi.third_party_message,
    ThirdPartyMessage.decode,
    O.fromEither,
    O.chainNullableK(message => message.details),
    O.map(details => ({
      ...details,
      attachments: pipe(
        attachmentsFromThirdPartyMessage(messageFromApi),
        O.toUndefined
      )
    }))
  );
