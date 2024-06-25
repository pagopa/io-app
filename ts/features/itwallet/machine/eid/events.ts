export type Start = {
  type: "start";
};

export type AcceptTos = {
  type: "accept-tos";
};

export type SelectIdentificationMode = {
  type: "select-identification-mode";
  mode: number;
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

export type RequestAssistance = {
  type: "request-assistance";
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

export type EidIssuanceEvents =
  | Start
  | AcceptTos
  | SelectIdentificationMode
  | AddToWallet
  | GoToWallet
  | AddNewCredential
  | RequestAssistance
  | Retry
  | Back
  | Close;
