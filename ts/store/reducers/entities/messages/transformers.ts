import { PublicMessage } from "../../../../../definitions/backend/PublicMessage";
import { EnrichedMessage } from "../../../../../definitions/backend/EnrichedMessage";

import { UIMessage } from "./types";

/**
 * Map an enriched message item from API to the app domain.
 *
 * @param messageFromApi
 */
export const toUIMessage = (messageFromApi: PublicMessage): UIMessage => {
  const enriched = messageFromApi as EnrichedMessage;
  return {
    id: messageFromApi.id,
    fiscalCode: messageFromApi.fiscal_code,
    category: null,
    createdAt: new Date(messageFromApi.created_at),
    serviceId: messageFromApi.sender_service_id,
    serviceName: enriched.service_name,
    organizationName: enriched.organization_name,
    title: enriched.message_title,
    timeToLive: messageFromApi.time_to_live
  };
};
