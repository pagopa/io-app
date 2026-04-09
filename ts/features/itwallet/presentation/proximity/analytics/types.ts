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

export type ItwStartReissuingPID = {
  position:
    | "ITW_CREDENTIAL_DETAIL"
    | "ITW_PRESENTATION_PID_DETAIL"
    | "ITW_QR_CODE";
};
