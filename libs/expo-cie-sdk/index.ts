import { type NativeModule, requireNativeModule } from "expo-modules-core";
import { Platform } from "react-native";

import type { Event, iOSAlertMessageKeys } from "./types";

export type { Event, iOSAlertMessageKeys } from "./types";

type NativeEvents = {
  onError: (event: { attemptsLeft: number; event: string }) => void;
  onEvent: (event: Event) => void;
  onSuccess: (event: { attemptsLeft: number; event: string }) => void;
};

declare class ExpoCieSdkModule extends NativeModule<NativeEvents> {
  enableLog(enabled: boolean): void;
  hasApiLevelSupport(): Promise<boolean>;
  hasNFCFeature(): Promise<boolean>;
  isNFCEnabled(): Promise<boolean>;
  launchCieID(): Promise<void>;
  openNFCSettings(): Promise<void>;
  setAlertMessage(key: iOSAlertMessageKeys, value: string): void;
  setAuthenticationUrl(url: string): void;
  setCustomIdpUrl(url: null | string): void;
  setPin(pin: string): Promise<void>;
  start(): Promise<void>;
  startListeningNFC(): Promise<void>;
  stopListeningNFC(): Promise<void>;
}

const nativeCie = requireNativeModule<ExpoCieSdkModule>("ExpoCieSdk");

/** Preserves the original CIE manager API and its singleton event callbacks. */
class CieManager {
  private errorHandlers = new Set<(error: Error) => void>();
  private eventHandlers = new Set<(event: Event) => void>();
  private successHandlers = new Set<(url: string) => void>();

  constructor() {
    nativeCie.addListener("onEvent", event => {
      this.eventHandlers.forEach(handler => handler(event));
    });
    nativeCie.addListener("onError", event => {
      this.errorHandlers.forEach(handler => handler(new Error(event.event)));
    });
    nativeCie.addListener("onSuccess", event => {
      this.successHandlers.forEach(handler => handler(event.event));
    });
  }

  enableLog = (enabled: boolean): void => nativeCie.enableLog(enabled);

  hasApiLevelSupport = (): Promise<boolean> => nativeCie.hasApiLevelSupport();

  hasNFCFeature = (): Promise<boolean> => nativeCie.hasNFCFeature();

  isCIEAuthenticationSupported = async (): Promise<boolean> => {
    try {
      const hasNFCFeature = await this.hasNFCFeature();
      const hasApiLevelSupport = await this.hasApiLevelSupport();
      return hasNFCFeature && hasApiLevelSupport;
    } catch {
      return false;
    }
  };

  isNFCEnabled = (): Promise<boolean> => nativeCie.isNFCEnabled();
  launchCieID = (): Promise<void> => nativeCie.launchCieID();
  onError = (handler: (error: Error) => void): void => {
    this.errorHandlers.add(handler);
  };
  onEvent = (handler: (event: Event) => void): void => {
    this.eventHandlers.add(handler);
  };

  onSuccess = (handler: (url: string) => void): void => {
    this.successHandlers.add(handler);
  };

  openNFCSettings = (): Promise<void> => nativeCie.openNFCSettings();

  removeAllListeners = (): void => {
    this.eventHandlers.clear();
    this.errorHandlers.clear();
    this.successHandlers.clear();
  };
  setAlertMessage = (key: iOSAlertMessageKeys, value: string): void => {
    if (Platform.OS === "ios") {
      nativeCie.setAlertMessage(key, value);
    }
  };
  setAuthenticationUrl = (url: string): void =>
    nativeCie.setAuthenticationUrl(url);
  setCustomIdpUrl = (url?: null | string): void =>
    nativeCie.setCustomIdpUrl(url ?? null);
  setPin = (pin: string): Promise<void> => nativeCie.setPin(pin);
  start = (
    config?: Partial<Record<iOSAlertMessageKeys, string>>
  ): Promise<void> => {
    if (config && Platform.OS === "ios") {
      Object.entries(config).forEach(([key, value]) => {
        this.setAlertMessage(key as iOSAlertMessageKeys, value);
      });
    }
    return nativeCie.start();
  };
  startListeningNFC = (): Promise<void> => nativeCie.startListeningNFC();

  stopListeningNFC = (): Promise<void> => nativeCie.stopListeningNFC();
}

export default new CieManager();
