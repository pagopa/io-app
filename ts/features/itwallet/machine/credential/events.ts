import { ErrorActorEvent } from "xstate5";
import { CredentialType } from "../../common/utils/itwMocksUtils";

export type Reset = {
  type: "reset";
};

export type SelecteCredential = {
  type: "select-credential";
  credentialType: CredentialType;
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
  | Reset
  | SelecteCredential
  | ConfirmTrustData
  | AddToWallet
  | Retry
  | Back
  | Close
  | ErrorActorEvent;
