import { pipe } from "fp-ts/lib/function";
import * as O from "fp-ts/lib/Option";
import { ThirdPartyMessage } from "../../../../../definitions/pn/ThirdPartyMessage";
import { ThirdPartyContent } from "../../../messages/store/reducers/thirdPartyById";
import { PNMessage } from "./types";

export const toPNMessage = (
  messageFromApi: ThirdPartyContent
): O.Option<PNMessage> =>
  pipe(
    messageFromApi.content.third_party_message,
    ThirdPartyMessage.decode,
    O.fromEither,
    O.chainNullableK(message => message.details),
    O.map(details => ({
      ...details,
      created_at: messageFromApi.content.created_at,
      attachments: messageFromApi.content.third_party_message.attachments
    }))
  );
