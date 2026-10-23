import { requireNativeModule } from "expo-modules-core";

import type { LogMode } from "./logger/types";
import type {
  CertificateData,
  CieAttributes,
  InternalAuthAndMrtdResponse,
  InternalAuthResponse,
  MrtdResponse,
  NfcError,
  NfcEvent
} from "./manager/types";

type CieEvents = {
  onAttributesSuccess: (attributes: CieAttributes) => void;
  onCertificateSuccess: (result: CertificateData) => void;
  onError: (error: NfcError) => void;
  onEvent: (event: NfcEvent) => void;
  onInternalAuthAndMRTDWithPaceSuccess: (
    result: InternalAuthAndMrtdResponse
  ) => void;
  onInternalAuthenticationSuccess: (result: InternalAuthResponse) => void;
  onMRTDWithPaceSuccess: (result: MrtdResponse) => void;
  onSuccess: (event: { url: string }) => void;
};

type CieNativeModule = {
  addListener: (
    eventName: keyof CieEvents,
    listener: (payload: unknown) => void
  ) => { remove: () => void };
  getLogs: () => Promise<string>;
  getLogsFilePath: () => Promise<string>;
  hasNfcFeature: () => Promise<boolean>;
  isCieAuthenticationSupported: () => Promise<boolean>;
  isNfcEnabled: () => Promise<boolean>;
  openNfcSettings: () => Promise<boolean>;
  removeAllListeners: (eventName: keyof CieEvents) => void;
  setAlertMessage: (key: string, value: string) => void;
  setCurrentAlertMessage: (value: string) => void;
  setCustomIdpUrl: (url: string) => void;
  setLogMode: (mode: LogMode) => void;
  startInternalAuthAndMRTDReading: (
    can: string,
    challenge: string,
    resultEncoding: string,
    timeout: number
  ) => Promise<void>;
  startInternalAuthentication: (
    challenge: string,
    resultEncoding: string,
    timeout: number
  ) => Promise<void>;
  startMRTDReading: (
    can: string,
    resultEncoding: string,
    timeout: number
  ) => Promise<void>;
  startReading: (
    pin: string,
    authUrl: string,
    timeout: number
  ) => Promise<void>;
  startReadingAttributes: (timeout: number) => Promise<void>;
  startReadingCertificate: (pin: string, timeout: number) => Promise<void>;
  stopReading: () => Promise<void>;
};

export const ExpoCieNative = requireNativeModule<CieNativeModule>("ExpoCie");
