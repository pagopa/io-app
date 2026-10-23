import type { Context } from "../machine/context";

import { ProximityFlow } from "./types";

/**
 * Maps the engagement mode and retrieval method to the `proximity_flow`
 * analytics property. NFC engagement falls back to "nfc_ble" until the verifier
 * picks NFC retrieval, since BLE is the default retrieval channel.
 */
export const getProximityFlow = ({
  engagementMode,
  retrievalMethod
}: Pick<Context, "engagementMode" | "retrievalMethod">): ProximityFlow => {
  if (engagementMode !== "nfc") {
    return "qr_code";
  }
  return retrievalMethod === "nfc" ? "nfc_nfc" : "nfc_ble";
};
