import { ErrorActorEvent } from "xstate";

import { MixPanelCredential } from "../../analytics/utils/types";
import { CredentialExitStep } from "../../common/hooks/useItwCredentialExitSurveyBottomSheet";
import { CredentialIssuanceMode } from "./context";

export type AddToWallet = {
  type: "add-to-wallet";
};

export type Back = {
  type: "back";
};

export type Close = {
  surveyCredential?: MixPanelCredential;
  /**
   * Step and credential at which the user exited, used to show the Qualtrics
   * survey in WALLET_HOME.
   */
  surveyStep?: CredentialExitStep;
  type: "close";
};

export type ConfirmCredentialOffer = {
  type: "confirm-credential-offer";
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
  | ConfirmCredentialOffer
  | ConfirmTrustData
  | Continue
  | ErrorActorEvent
  | Retry
  | SelectCredential
  | SessionRefreshComplete
  | StartCredentialOffer;

export type Retry = {
  type: "retry";
};

export type SelectCredential = {
  credentialType: string;
  mode: CredentialIssuanceMode;
  type: "select-credential";
};

export type StartCredentialOffer = {
  itwCredentialOfferUri: string;
  type: "start-credential-offer";
};

type SessionRefreshComplete = {
  type: "session-refresh-complete";
};
