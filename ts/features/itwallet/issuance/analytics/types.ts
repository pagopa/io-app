import {
  ItwFlow,
  ItwIdMethod,
  MixPanelCredential
} from "../../analytics/utils/analyticsTypes";

export type BackToWallet = {
  exit_page: string;
  credential: Extract<MixPanelCredential, "ITW_ID_V2">;
};

export type ItwExit = {
  exit_page: string;
  credential: MixPanelCredential;
};

type ItwFailureCause = "CredentialIssuer" | "WalletProvider";

export type AddCredentialFailure = {
  credential: MixPanelCredential;
  reason: unknown;
  type: string;
  caused_by: ItwFailureCause;
};

export type IdRequestFailure = {
  ITW_ID_method: ItwIdMethod;
  reason: unknown;
  type: string;
  caused_by: ItwFailureCause;
  itw_flow: ItwFlow;
};

export type IdUnexpectedFailure = {
  reason: unknown;
  type: string;
  itw_flow: ItwFlow;
};

export type CredentialUnexpectedFailure = {
  credential: MixPanelCredential;
  reason: unknown;
  type: string;
};

export type ItwCredentialReissuingFailedProperties = {
  reason: unknown;
  credential_failed: MixPanelCredential;
  itw_flow: ItwFlow;
  type: string;
};

export type TrackCredentialPreview = {
  credential: MixPanelCredential; // MixPanelCredential
  credential_type?: "multiple" | "unique";
};

export type TrackGetChallengeInfoFailure = {
  ITW_ID_method: ItwIdMethod;
  reason?: string;
};
