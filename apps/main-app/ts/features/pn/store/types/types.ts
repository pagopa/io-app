import { ThirdPartyAttachment } from "@io-app/api-types/generated/definitions/communication/ThirdPartyAttachment";
import { IOReceivedNotification } from "@io-app/api-types/generated/definitions/pn/IOReceivedNotification";

export type PNMessage = IOReceivedNotification & {
  attachments?: ReadonlyArray<ThirdPartyAttachment>;
  created_at: Date;
};
