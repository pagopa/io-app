import { ErrorActorEvent } from "xstate";
import { SpidIdp } from "../../../../utils/idps";
import { CiePreparationType } from "../../identification/cie/components/ItwCiePreparationBaseScreenContent";

export type IdentificationMode = "spid" | "ciePin" | "cieId";

export type Start = {
  type: "start";
  isL3?: boolean;
};

export type AcceptTos = {
  type: "accept-tos";
};

export type AcceptIpzsPrivacy = {
  type: "accept-ipzs-privacy";
};

export type AddToWallet = {
  type: "add-to-wallet";
};

export type GoToWallet = {
  type: "go-to-wallet";
};

export type AddNewCredential = {
  type: "add-new-credential";
};

export type SelectIdentificationMode = {
  type: "select-identification-mode";
  mode: IdentificationMode;
};

export type GoToCieWarning = {
  type: "go-to-cie-warning";
  warning: CiePreparationType;
};

export type SelectSpidIdp = {
  type: "select-spid-idp";
  idp: SpidIdp;
};

export type CiePinEntered = {
  type: "cie-pin-entered";
  pin: string;
};

export type UserIdentificationCompleted = {
  type: "user-identification-completed";
  authRedirectUrl: string;
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

export type NfcEnabled = {
  type: "nfc-enabled";
};

export type Abort = {
  type: "abort";
};

export type RevokeWalletInstance = {
  type: "revoke-wallet-instance";
};

export type ExternalErrorEvent = {
  type: "error";
  // Add a custom error code to the error event to distinguish between different errors. Add a new error code for each different error if needed.
  scope: "ipzs-privacy" | "spid-login" | "cieid-login";
  error?: Error;
};

export type StartReissuing = {
  type: "start-reissuing";
};

export type Next = {
  type: "next";
};

export type Reset = {
  type: "reset";
};

export type GoToL2IdentificationMode = {
  type: "go-to-l2-identification";
};

export type EidIssuanceEvents =
  | Start
  | AcceptTos
  | AcceptIpzsPrivacy
  | SelectIdentificationMode
  | SelectSpidIdp
  | CiePinEntered
  | UserIdentificationCompleted
  | AddToWallet
  | GoToWallet
  | AddNewCredential
  | Retry
  | Back
  | Close
  | NfcEnabled
  | Abort
  | RevokeWalletInstance
  | ErrorActorEvent
  | ExternalErrorEvent
  | StartReissuing
  | GoToCieWarning
  | Next
  | GoToL2IdentificationMode
  | Reset;
