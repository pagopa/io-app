import { IOReceivedNotification } from "../../../../../definitions/pn/IOReceivedNotification";
import { UIAttachment } from "../../../messages/types";

export type PNMessage = IOReceivedNotification & {
  created_at: Date;
  attachments?: ReadonlyArray<UIAttachment>;
};
