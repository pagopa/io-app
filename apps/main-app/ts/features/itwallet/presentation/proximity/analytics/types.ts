import { MixPanelCredential } from "../../../analytics/utils/types";

export type ItwProximityFailure = {
  origin?: string;
  reason: unknown;
  type: string;
};

export type ItwProximityFlowProperties = {
  proximity_flow: ProximityFlow;
};

export type ItwProximityGenericFailure = ItwProximityFailure & {
  proximity_sharing_status: "post" | "pre";
};

export type ItwProximityHttpFailure = {
  reason: unknown;
};

export type ItwProximityMandatoryCredentialMissing = {
  missing_credential: string;
  missing_credential_number: number;
};

export type ItwProximityQrCode = {
  qr_code_status: "generation_failed" | "PID_expired" | "valid";
  source: "ITW_CREDENTIAL_DETAIL" | "WALLET_HOME";
};

export type ItwProximityShowQrCode = {
  credential: "general" | MixPanelCredential;
  position:
    | "ITW_CREDENTIAL_CARD_MODAL"
    | "ITW_CREDENTIAL_DETAIL"
    | "WALLET_HOME";
};

export type ItwQRCodeLoadingFailure = {
  reason: string;
};

/**
 * Locale-independent identifiers of the action chosen in the revoke-consent
 * alert. Never derive these from translated button labels, otherwise the
 * tracked value would change with the app language.
 */
export type ItwRevokeConsentUserAction = "cancel" | "confirm";

export type ItwStartReissuingPID = {
  position:
    | "ITW_CREDENTIAL_DETAIL"
    | "ITW_PRESENTATION_PID_DETAIL"
    | "ITW_QR_CODE";
};

export type ProximityFlow = "nfc" | "qr_code";
