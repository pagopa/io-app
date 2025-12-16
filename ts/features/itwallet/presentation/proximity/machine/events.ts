import type {
  ProximityDetails,
  VerifierRequest
} from "../utils/itwProximityTypeUtils";

export type Start = {
  type: "start";
  credentialType: string;
};

export type Back = {
  type: "back";
};

export type Close = {
  type: "close";
};

export type Continue = {
  type: "continue";
};

export type Dismiss = {
  type: "dismiss";
};

export type Retry = {
  type: "retry";
};

export type DeviceConnecting = {
  type: "device-connecting";
};

export type DeviceConnected = {
  type: "device-connected";
};

export type DeviceDisconnected = {
  type: "device-disconnected";
};

export type DeviceError = {
  type: "device-error";
  error: Error;
};

export type DeviceDocumentRequestReceived = {
  type: "device-document-request-received";
  proximityDetails: ProximityDetails;
  verifierRequest: VerifierRequest;
};

export type Consent = {
  type: "holder-consent";
};

export type ProximityEvents =
  | Start
  | Back
  | Consent
  | Continue
  | Close
  | Dismiss
  | Retry
  | DeviceConnecting
  | DeviceConnected
  | DeviceDisconnected
  | DeviceError
  | DeviceDocumentRequestReceived;
