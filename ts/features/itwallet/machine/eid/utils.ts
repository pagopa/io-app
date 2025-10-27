import { EidIssuanceLevel } from "./context";

/**
 * Utility function to determine if L3 features are enabled based on the issuance level.
 */
export const isL3IssuanceFeaturesEnabled = (level?: EidIssuanceLevel) =>
  level === "l3" || // L3 PID issuance
  level === "l2-plus"; // L3 PID issuance with L2+ plus flow
