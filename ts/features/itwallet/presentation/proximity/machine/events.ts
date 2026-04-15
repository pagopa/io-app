import type {
  ProximityDetails,
  VerifierRequest
} from "../utils/itwProximityTypeUtils";

export type Back = {
  type: "back";
};

export type Close = {
  type: "close";
};

export type Consent = {
  type: "holder-consent";
};

export type Continue = {
  type: "continue";
};

export type DeviceConnected = {
  type: "device-connected";
};

export type DeviceConnecting = {
  type: "device-connecting";
};

export type DeviceDisconnected = {
  type: "device-disconnected";
};

export type DeviceDocumentRequestReceived = {
  proximityDetails: ProximityDetails;
  type: "device-document-request-received";
  verifierRequest: VerifierRequest;
};

export type DeviceError = {
  error: Error;
  type: "device-error";
};

export type Dismiss = {
  type: "dismiss";
};

export type ProximityEvents =
  | Back
  | Close
  | Consent
  | Continue
  | DeviceConnected
  | DeviceConnecting
  | DeviceDisconnected
  | DeviceDocumentRequestReceived
  | DeviceError
  | Dismiss
  | QrCodeString
  | Retry
  | Start;

export type QrCodeString = {
  payload: string;
  type: "qr-code-string";
};

export type Retry = {
  type: "retry";
};

export type Start = {
  type: "start";
};
