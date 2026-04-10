import { MixPanelCredential } from "../../../analytics/utils/types";

export type ItwProximityFailure = {
  reason: unknown;
  type: string;
};

export type ItwProximityGenericFailure = ItwProximityFailure & {
  proximity_sharing_status: "pre" | "post";
};

export type ItwQrCode = {
  source: "ITW_CREDENTIAL_DETAIL" | "WALLET_HOME";
  qr_code_status: "valid" | "generation_failed" | "PID_expired";
};

export type ItwQRCodeLoadingFailure = {
  reason: string;
};

export type ItwShowQrCode = {
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
