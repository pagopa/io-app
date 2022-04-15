import { ServicePublic } from "../../../../../definitions/backend/ServicePublic";
import { logosForService } from "../../../../utils/services";

import { UIService } from "./types";

/**
 * Transform a Service model from API to the UI equivalent.
 *
 * @param service
 */
export function toUIService(service: ServicePublic): UIService {
  return {
    id: service.service_id,
    name: service.service_name,
    organizationName: service.organization_name,
    organizationFiscalCode: service.organization_fiscal_code,
    email: service.service_metadata?.email,
    phone: service.service_metadata?.phone,
    logoURLs: logosForService(service),
    raw: service
  };
}
