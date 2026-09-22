import { InternalAuthAndMrtdResponse } from "@pagopa/io-react-native-cie";
import { DoneActorEvent, ErrorActorEvent } from "xstate";

import type { IssuanceFailure } from "./failure";

import { SpidIdp } from "../../../../utils/idps";
import { EidActivationExitStep } from "../../common/hooks/useItwActivationExitSurveyBottomSheet";
import { CieWarningType } from "../../identification/cie/utils/types";
import { Output } from "../upgrade/output";
import { EidIssuanceLevel, EidIssuanceMode } from "./context";

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
  | DoneActorEvent<Output, "credentialUpgradeMachine">
  | ErrorActorEvent
  | ExternalErrorEvent
  | GoToCieWarning
  | GoToIpzsPrivacy
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
  | SessionRefreshComplete
  | SimulateFailure
  | Start
  | UserIdentificationCompleted;

type Abort = {
  type: "abort";
};

type AcceptIpzsPrivacy = {
  type: "accept-ipzs-privacy";
};

type AcceptTos = {
  type: "accept-tos";
};

type AddNewCredential = {
  type: "add-new-credential";
};

type AddToWallet = {
  type: "add-to-wallet";
};

type Back = {
  type: "back";
};

type CieCanEntered = {
  can: string;
  type: "cie-can-entered";
};

type CiePinEntered = {
  pin: string;
  type: "cie-pin-entered";
};

type Close = {
  /** Step at which the user exited, used to show the Qualtrics survey in WALLET_HOME. */
  surveyStep?: EidActivationExitStep;
  type: "close";
};

type ExternalErrorEvent = {
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

type GoToCieWarning = {
  routeName: string;
  type: "go-to-cie-warning";
  warning: CieWarningType;
};

type GoToIpzsPrivacy = {
  type: "go-to-ipzs-privacy";
};

type GoToWallet = {
  type: "go-to-wallet";
};

type IdentificationMode = "cieId" | "ciePin" | "spid";

type MrtdChallengedSigned = {
  data: InternalAuthAndMrtdResponse;
  type: "mrtd-challenged-signed";
};

type MrtdPoPVerificationCompleted = {
  authRedirectUrl: string;
  type: "mrtd-pop-verification-completed";
};

type Next = {
  type: "next";
};

type NfcEnabled = {
  type: "nfc-enabled";
};

type Reset = {
  type: "reset";
};

type Retry = {
  type: "retry";
};

type RevokeWalletInstance = {
  type: "revoke-wallet-instance";
};

type SelectIdentificationMode = {
  mode: IdentificationMode;
  type: "select-identification-mode";
};

type SelectSpidIdp = {
  idp: SpidIdp;
  type: "select-spid-idp";
};

type SessionRefreshComplete = {
  type: "session-refresh-complete";
};

type SimulateFailure = {
  failure: IssuanceFailure;
  type: "simulate-failure";
};

/**
 * This event is used to either start the issuance process or restart it.
 * - "start" is used to start the issuance process from the beginning, going from the initial state (Idle) to the next state.
 * - "restart" is used to restart the issuance process, **going back** to the initial state (Idle) from any other state
 *    and starting the issuance process from the beginning.
 */
type Start = {
  credentialType?: string;
  level: EidIssuanceLevel;
  mode: EidIssuanceMode;
  type: "restart" | "start";
};

type UserIdentificationCompleted = {
  authRedirectUrl: string;
  type: "user-identification-completed";
};
