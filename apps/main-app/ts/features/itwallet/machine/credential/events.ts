import { ErrorActorEvent } from "xstate";

import { CredentialIssuanceMode } from "./context";

export type AddToWallet = {
  type: "add-to-wallet";
};

export type Back = {
  type: "back";
};

export type Close = {
  type: "close";
};

export type ConfirmTrustData = {
  type: "confirm-trust-data";
};

export type Continue = {
  type: "continue";
};

export type CredentialIssuanceEvents =
  | AddToWallet
  | Back
  | Close
  | ConfirmTrustData
  | Continue
  | ErrorActorEvent
  | Retry
  | SelectCredential
  | SessionRefreshComplete;

export type Retry = {
  type: "retry";
};

export type SelectCredential = {
  credentialType: string;
  mode: CredentialIssuanceMode;
  type: "select-credential";
};

type SessionRefreshComplete = {
  type: "session-refresh-complete";
};
