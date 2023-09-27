import { IOReceivedNotification } from "../../../../../definitions/pn/IOReceivedNotification";
import { UIAttachment } from "../../../../store/reducers/entities/messages/types";

export type PNMessage = IOReceivedNotification &
  Readonly<{
    attachments?: ReadonlyArray<UIAttachment>;
  }>;
