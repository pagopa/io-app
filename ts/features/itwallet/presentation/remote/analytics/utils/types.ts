export type ItwRemoteFailure = {
  reason: unknown;
  type: string;
};

export type ItwRemoteMissingCredential = {
  missing_credential: string;
  missing_credential_number: number;
};

export type ItwRemoteInvalidCredential = {
  not_valid_credential: string;
  not_valid_credential_number: number;
};

export type ItwRemoteDataShare = {
  data_type: "required" | "optional";
  request_type: "unique_purpose" | "multiple_purpose" | "no_purpose";
};

/**
 * Actions that trigger the requirement for L3 upgrade.
 * This type represents the user action that was performed immediately before
 * the L3 mandatory upgrade screen was displayed.
 * Add new values when implementing additional flows that require L3 upgrade.
 */
export enum ItwL3UpgradeTrigger {
  REMOTE_QR_CODE = "remote_qr_code"
}
