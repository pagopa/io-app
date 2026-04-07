/**
 * Actions that trigger the requirement for L3 upgrade.
 * This type represents the user action that was performed immediately before
 * the L3 mandatory upgrade screen was displayed.
 * Add new values when implementing additional flows that require L3 upgrade.
 */
export enum ItwL3UpgradeTrigger {
  REMOTE_QR_CODE = "remote_qr_code"
}

export type ItwRemoteCredentialCombination =
  | "other_credentials"
  | "PID"
  | "PID_and_credentials";

export type ItwRemoteDataShare = {
  credential_type: ItwRemoteCredentialCombination;
  data_type: "optional" | "required";
  request_type: "multiple_purpose" | "no_purpose" | "unique_purpose";
};

export type ItwRemoteFailure = {
  reason: unknown;
  type: string;
};

export type ItwRemoteInvalidCredential = {
  not_valid_credential: string;
  not_valid_credential_number: number;
};

export type ItwRemoteMissingCredential = {
  missing_credential: string;
  missing_credential_number: number;
};
