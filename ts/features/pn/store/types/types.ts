import { ThirdPartyAttachment } from "../../../../../definitions/backend/communication/ThirdPartyAttachment";
import { IOReceivedNotification } from "../../../../../definitions/pn/IOReceivedNotification";

export type PNMessage = IOReceivedNotification & {
  created_at: Date;
  attachments?: ReadonlyArray<ThirdPartyAttachment>;
};
