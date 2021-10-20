import { FiscalCode } from "../../../../../definitions/backend/FiscalCode";
import { Timestamp } from "../../../../../definitions/backend/Timestamp";
import { ServiceId } from "../../../../../definitions/backend/ServiceId";
import { TimeToLiveSeconds } from "../../../../../definitions/backend/TimeToLiveSeconds";

/**
 * Domain-specific representation of a Message with aggregated data.
 */
export type UIMessage = {
  id: string;
  fiscalCode: FiscalCode;
  createdAt: Timestamp;
  serviceId: ServiceId;
  serviceName?: string;
  organizationName?: string;
  title?: string;
  timeToLive?: TimeToLiveSeconds;
};
