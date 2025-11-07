import { EidIssuanceLevel } from "./context";

/**
 * Utility function to determine if L3 features are enabled based on the issuance level.
 * L3 features are enabled for levels "l3" and "l3-next".
 */
export const isL3IssuanceFeaturesEnabled = (level?: EidIssuanceLevel) =>
  level?.startsWith("l3") || false;
