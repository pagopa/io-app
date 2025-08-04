import { ErrorActorEvent } from "xstate";
import { CredentialIssuanceMode } from "./context";

export type SelectCredential = {
  type: "select-credential";
  credentialType: string;
  mode: CredentialIssuanceMode;
  isAsyncContinuation?: boolean; // TODO to be removed in [SIW-2839]
};

export type ConfirmTrustData = {
  type: "confirm-trust-data";
};

export type AddToWallet = {
  type: "add-to-wallet";
};

export type Retry = {
  type: "retry";
};

export type Back = {
  type: "back";
};

export type Close = {
  type: "close";
};

export type CredentialIssuanceEvents =
  | SelectCredential
  | ConfirmTrustData
  | AddToWallet
  | Retry
  | Back
  | Close
  | ErrorActorEvent;
