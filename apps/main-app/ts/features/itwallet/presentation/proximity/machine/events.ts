import { ISO18013_5 } from "@pagopa/io-react-native-iso18013";

import type { ProximityDetails, VerifierRequest } from "../utils/types";

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
  retrievalMethod: ISO18013_5.RetrievalMethod;
  type: "device-document-request-received";
  verifierRequest: VerifierRequest;
};

export type DeviceError = {
  error: Error;
  type: "device-error";
};

export type NfcStarted = {
  type: "nfc-started";
};

export type NfcStopped = {
  type: "nfc-stopped";
};

export type ProximityEvents =
  | Close
  | Consent
  | Continue
  | DeviceConnected
  | DeviceConnecting
  | DeviceDisconnected
  | DeviceDocumentRequestReceived
  | DeviceError
  | NfcStarted
  | NfcStopped
  | QrCodeString
  | Retry
  | Start
  | StartNfcPresentment
  | StoreConsent;

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

export type StartNfcPresentment = {
  type: "start-nfc-presentment";
};

export type StoreConsent = {
  type: "store-consent";
};
