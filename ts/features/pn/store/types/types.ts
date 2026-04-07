import { ThirdPartyAttachment } from "../../../../../definitions/backend/ThirdPartyAttachment";
import { IOReceivedNotification } from "../../../../../definitions/pn/IOReceivedNotification";

export type PNMessage = IOReceivedNotification & {
  attachments?: ReadonlyArray<ThirdPartyAttachment>;
  created_at: Date;
};
