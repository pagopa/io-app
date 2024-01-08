import { IOReceivedNotification } from "../../../../../definitions/pn/IOReceivedNotification";
import { UIAttachment } from "../../../messages/types";

export type PNMessage = IOReceivedNotification &
  Readonly<{
    attachments?: ReadonlyArray<UIAttachment>;
  }>;
