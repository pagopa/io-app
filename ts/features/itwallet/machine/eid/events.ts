import { InternalAuthAndMrtdResponse } from "@pagopa/io-react-native-cie";
import { ErrorActorEvent } from "xstate";
import { SpidIdp } from "../../../../utils/idps";
import { CieWarningType } from "../../identification/cie/utils/types";
import { EidIssuanceLevel, EidIssuanceMode } from "./context";

export type IdentificationMode = "spid" | "ciePin" | "cieId";

/**
 * This event is used to either start the issuance process or restart it.
 * - "start" is used to start the issuance process from the beginning, going from the initial state (Idle) to the next state.
 * - "restart" is used to restart the issuance process, **going back** to the initial state (Idle) from any other state
 *    and starting the issuance process from the beginning.
 */
export type Start = {
  type: "start" | "restart";
  mode: EidIssuanceMode;
  level: EidIssuanceLevel;
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
  warning: CieWarningType;
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

export type CieCanEntered = {
  type: "cie-can-entered";
  can: string;
};

export type MrtdChallengedSigned = {
  type: "mrtd-challenged-signed";
  data: InternalAuthAndMrtdResponse;
};

export type MrtdPoPVerificationCompleted = {
  type: "mrtd-pop-verification-completed";
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
  scope:
    | "ipzs-privacy"
    | "spid-login"
    | "cieid-login"
    | "cie-auth"
    | "cie-mrtd-pop";
  error?: Error;
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
  | CieCanEntered
  | MrtdChallengedSigned
  | MrtdPoPVerificationCompleted
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
  | GoToCieWarning
  | Next
  | GoToL2IdentificationMode
  | Reset;
