import { ImageURISource } from "react-native";

/**
 * Domain-specific representation of a Service with aggregated data.
 */
export type UIService = {
  id: string;
  name: string;
  organizationName: string;
  organizationFiscalCode: string;
  email?: string;
  phone?: string;
  logoURLs: ReadonlyArray<ImageURISource>;
};
