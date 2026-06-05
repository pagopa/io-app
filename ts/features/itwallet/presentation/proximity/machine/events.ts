import { ISO18013_5 } from "@pagopa/io-react-native-iso18013";
import type { ProximityDetails, VerifierRequest } from "../utils/types";

export type Start = {
  type: "start";
};

export type Close = {
  type: "close";
};

export type Continue = {
  type: "continue";
};

export type Retry = {
  type: "retry";
};

export type QrCodeString = {
  type: "qr-code-string";
  payload: string;
};

export type StartNfcPresentment = {
  type: "start-nfc-presentment";
};

export type NfcStarted = {
  type: "nfc-started";
};

export type NfcStopped = {
  type: "nfc-stopped";
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
  retrievalMethod: ISO18013_5.RetrievalMethod;
};

export type Consent = {
  type: "holder-consent";
};

export type StoreConsent = {
  type: "store-consent";
};

export type ProximityEvents =
  | Start
  | Consent
  | StoreConsent
  | Continue
  | Close
  | Retry
  | NfcStarted
  | NfcStopped
  | QrCodeString
  | StartNfcPresentment
  | DeviceConnecting
  | DeviceConnected
  | DeviceDisconnected
  | DeviceError
  | DeviceDocumentRequestReceived;
