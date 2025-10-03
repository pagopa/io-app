import { MessageBodyMarkdown } from "../../../../../definitions/backend/MessageBodyMarkdown";
import { UIMessageDetails } from "../../../messages/types";

export const fillerEphemeralAARMarkdown =
  "EPHEMERAL_AAR_INVALID_MARKDOWN".repeat(3) as MessageBodyMarkdown;
export const isAarDetailById = (message: UIMessageDetails): boolean =>
  message.markdown === fillerEphemeralAARMarkdown;
