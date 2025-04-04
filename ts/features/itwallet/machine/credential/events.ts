import { ErrorActorEvent } from "xstate";

export type SelectCredential = {
  type: "select-credential";
  credentialType: string;
  skipNavigation?: boolean;
  asyncContinuation?: boolean;
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
