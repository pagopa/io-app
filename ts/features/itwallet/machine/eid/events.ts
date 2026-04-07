import { InternalAuthAndMrtdResponse } from "@pagopa/io-react-native-cie";
import { DoneActorEvent, ErrorActorEvent } from "xstate";

import type { IssuanceFailure } from "./failure";

import { SpidIdp } from "../../../../utils/idps";
import { CieWarningType } from "../../identification/cie/utils/types";
import { Output } from "../upgrade/output";
import { EidIssuanceLevel, EidIssuanceMode } from "./context";

export type Abort = {
  type: "abort";
};

export type AcceptIpzsPrivacy = {
  type: "accept-ipzs-privacy";
};

export type AcceptTos = {
  type: "accept-tos";
};

export type AddNewCredential = {
  type: "add-new-credential";
};

export type AddToWallet = {
  type: "add-to-wallet";
};

export type Back = {
  type: "back";
};

export type CieCanEntered = {
  can: string;
  type: "cie-can-entered";
};

export type CiePinEntered = {
  pin: string;
  type: "cie-pin-entered";
};

export type Close = {
  type: "close";
};

export type EidIssuanceEvents =
  | Abort
  | AcceptIpzsPrivacy
  | AcceptTos
  | AddNewCredential
  | AddToWallet
  | Back
  | CieCanEntered
  | CiePinEntered
  | Close
  | DoneActorEvent<Output>
  | ErrorActorEvent
  | ExternalErrorEvent
  | GoToCieWarning
  | GoToL2IdentificationMode
  | GoToWallet
  | MrtdChallengedSigned
  | MrtdPoPVerificationCompleted
  | Next
  | NfcEnabled
  | Reset
  | Retry
  | RevokeWalletInstance
  | SelectIdentificationMode
  | SelectSpidIdp
  | SimulateFailure
  | Start
  | UserIdentificationCompleted;

export type ExternalErrorEvent = {
  error?: Error;
  // Add a custom error code to the error event to distinguish between different errors. Add a new error code for each different error if needed.
  scope:
    | "cie-auth"
    | "cie-mrtd-pop"
    | "cieid-login"
    | "ipzs-privacy"
    | "spid-login";
  type: "error";
};

export type GoToCieWarning = {
  type: "go-to-cie-warning";
  warning: CieWarningType;
  routeName: string;
};

export type GoToL2IdentificationMode = {
  type: "go-to-l2-identification";
};

export type GoToWallet = {
  type: "go-to-wallet";
};

export type IdentificationMode = "cieId" | "ciePin" | "spid";

export type MrtdChallengedSigned = {
  data: InternalAuthAndMrtdResponse;
  type: "mrtd-challenged-signed";
};

export type MrtdPoPVerificationCompleted = {
  authRedirectUrl: string;
  type: "mrtd-pop-verification-completed";
};

export type Next = {
  type: "next";
};

export type NfcEnabled = {
  type: "nfc-enabled";
};

export type Reset = {
  type: "reset";
};

export type Retry = {
  type: "retry";
};

export type RevokeWalletInstance = {
  type: "revoke-wallet-instance";
};

export type SelectIdentificationMode = {
  mode: IdentificationMode;
  type: "select-identification-mode";
};

export type SelectSpidIdp = {
  idp: SpidIdp;
  type: "select-spid-idp";
};

export type SimulateFailure = {
  failure: IssuanceFailure;
  type: "simulate-failure";
};

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
  credentialType?: string;
};

export type UserIdentificationCompleted = {
  authRedirectUrl: string;
  type: "user-identification-completed";
};
