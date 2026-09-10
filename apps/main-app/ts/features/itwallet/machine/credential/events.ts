import { ErrorActorEvent } from "xstate";

import { MixPanelCredential } from "../../analytics/utils/types";
import { CredentialExitStep } from "../../common/hooks/useItwCredentialExitSurveyBottomSheet";
import { CredentialIssuanceMode } from "./context";

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

type AddToWallet = {
  type: "add-to-wallet";
};

type Back = {
  type: "back";
};

type Close = {
  surveyCredential?: MixPanelCredential;
  /** Step and credential at which the user exited, used to show the Qualtrics survey in WALLET_HOME. */
  surveyStep?: CredentialExitStep;
  type: "close";
};

type ConfirmCredentialOffer = {
  type: "confirm-credential-offer";
};

type ConfirmTrustData = {
  type: "confirm-trust-data";
};

type Continue = {
  type: "continue";
};

type Retry = {
  type: "retry";
};

type SelectCredential = {
  credentialType: string;
  mode: CredentialIssuanceMode;
  type: "select-credential";
};

type SessionRefreshComplete = {
  type: "session-refresh-complete";
};

type StartCredentialOffer = {
  itwCredentialOfferUri: string;
  type: "start-credential-offer";
};
