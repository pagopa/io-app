import { ImageURISource } from "react-native";
import { ServicePublic } from "../../../../../definitions/backend/ServicePublic";
import { ServiceId } from "../../../../../definitions/backend/ServiceId";

/**
 * Domain-specific representation of a Service with aggregated data.
 */
export type UIService = {
  id: ServiceId;
  name: string;
  organizationName: string;
  organizationFiscalCode: string;
  email?: string;
  phone?: string;
  logoURLs: ReadonlyArray<ImageURISource>;

  // @deprecated please use it only for backward compatibility
  raw: ServicePublic;
};
