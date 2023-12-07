import { ActionType, createAsyncAction } from "typesafe-actions";
import { ThirdPartyMessageWithContent } from "../../../../../definitions/backend/ThirdPartyMessageWithContent";
import { UIMessageId } from "../../../../store/reducers/entities/messages/types";
import { ServiceId } from "../../../../../definitions/backend/ServiceId";

/**
 * The user requests the message third party content.
 */
export const loadThirdPartyMessage = createAsyncAction(
  "THIRD_PARTY_MESSAGE_LOAD_REQUEST",
  "THIRD_PARTY_MESSAGE_LOAD_SUCCESS",
  "THIRD_PARTY_MESSAGE_LOAD_FAILURE"
)<
  { id: UIMessageId; serviceId: ServiceId; tag: string },
  { id: UIMessageId; content: ThirdPartyMessageWithContent },
  { id: UIMessageId; error: Error }
>();

export type ThirdPartyMessageActions = ActionType<typeof loadThirdPartyMessage>;
