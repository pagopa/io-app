import { MixPanelCredential } from "../../../analytics/utils/types";

export type ItwProximityFailure = {
  origin?: string;
  reason: unknown;
  type: string;
};

export type ItwProximityGenericFailure = ItwProximityFailure & {
  proximity_sharing_status: "post" | "pre";
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

export type ItwStartReissuingPID = {
  position:
    | "ITW_CREDENTIAL_DETAIL"
    | "ITW_PRESENTATION_PID_DETAIL"
    | "ITW_QR_CODE";
};
