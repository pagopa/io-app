import { MixPanelCredential } from "../../../analytics/utils/types";

export type ProximityFlow = "qr_code" | "nfc";

export type ItwProximityFailure = {
  reason: unknown;
  origin?: string;
  type: string;
};

export type ItwProximityFlowProperties = {
  proximity_flow: ProximityFlow;
};

export type ItwProximityGenericFailure = ItwProximityFailure & {
  proximity_sharing_status: "pre" | "post";
};

export type ItwProximityQrCode = {
  source: "ITW_CREDENTIAL_DETAIL" | "WALLET_HOME";
  qr_code_status: "valid" | "generation_failed" | "PID_expired";
};

export type ItwQRCodeLoadingFailure = {
  reason: string;
};

export type ItwProximityShowQrCode = {
  credential: MixPanelCredential | "general";
  position:
    | "ITW_CREDENTIAL_DETAIL"
    | "ITW_CREDENTIAL_CARD_MODAL"
    | "WALLET_HOME";
};

export type ItwStartReissuingPID = {
  position:
    | "ITW_CREDENTIAL_DETAIL"
    | "ITW_PRESENTATION_PID_DETAIL"
    | "ITW_QR_CODE";
};
