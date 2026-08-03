import { ISO18013_5 } from "@pagopa/io-react-native-iso18013";

import type { ProximityDetails, VerifierRequest } from "../utils/types";

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

type Close = {
  type: "close";
};

type Consent = {
  type: "holder-consent";
};

type Continue = {
  type: "continue";
};

type DeviceConnected = {
  type: "device-connected";
};

type DeviceConnecting = {
  type: "device-connecting";
};

type DeviceDisconnected = {
  type: "device-disconnected";
};

type DeviceDocumentRequestReceived = {
  proximityDetails: ProximityDetails;
  retrievalMethod: ISO18013_5.RetrievalMethod;
  type: "device-document-request-received";
  verifierRequest: VerifierRequest;
};

type DeviceError = {
  error: Error;
  type: "device-error";
};

type NfcStarted = {
  type: "nfc-started";
};

type NfcStopped = {
  type: "nfc-stopped";
};

type QrCodeString = {
  payload: string;
  type: "qr-code-string";
};

type Retry = {
  type: "retry";
};

type Start = {
  type: "start";
};

type StartNfcPresentment = {
  type: "start-nfc-presentment";
};

type StoreConsent = {
  type: "store-consent";
};
