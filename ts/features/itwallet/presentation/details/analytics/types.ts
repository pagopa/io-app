import { MixPanelCredential } from "../../../analytics/utils/types";

export type TrackCredentialDetail = {
  credential: MixPanelCredential; // MixPanelCredential
  credential_status: string; // ItwPg
  credential_type?: "multiple" | "unique";
};

/**
 * Actions that can trigger the eID reissuing flow.
 * This type represents the user action that was performed immediately before
 * the eID reissuing process is initiated.
 * Add new values here when implementing additional flows that should start
 * the reissuing procedure.
 */
export enum ItwEidReissuingTrigger {
  ADD_CREDENTIAL = "add_credential"
}
