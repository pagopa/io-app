import {
  ItwFlow,
  ItwIdMethod,
  MixPanelCredential
} from "../../analytics/utils/types";

export type AddCredentialFailure = {
  caused_by: ItwFailureCause;
  credential: MixPanelCredential;
  reason: unknown;
  type: string;
};

export type BackToWallet = {
  credential: Extract<MixPanelCredential, "ITW_ID_V2">;
  exit_page: string;
};

export type CredentialUnexpectedFailure = {
  credential: MixPanelCredential;
  origin?: string;
  reason: unknown;
  type: string;
};

export type IdRequestFailure = {
  caused_by: ItwFailureCause;
  itw_flow: ItwFlow;
  ITW_ID_method: ItwIdMethod;
  reason: unknown;
  type: string;
};

export type IdRequestFederationFailure = {
  credential: "ITW_ID" | "ITW_PID";
  reason: unknown;
  type: string;
};

export type IdUnexpectedFailure = {
  itw_flow: ItwFlow;
  origin?: string;
  reason: unknown;
  type: string;
};

export type ItwCredentialReissuingFailedProperties = {
  credential_failed: MixPanelCredential;
  itw_flow: ItwFlow;
  reason: unknown;
  type: string;
};

export type ItwExit = {
  credential: MixPanelCredential;
  exit_page: string;
};

export type TrackCredentialPreview = {
  credential: MixPanelCredential; // MixPanelCredential
  credential_type?: "multiple" | "unique";
};

export type TrackGetChallengeInfoFailure = {
  ITW_ID_method: ItwIdMethod;
  reason?: string;
};

type ItwFailureCause = "CredentialIssuer" | "WalletProvider";
