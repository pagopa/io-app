import cieManager, { Event as CEvent } from "@pagopa/react-native-cie";
import { Platform } from "react-native";
import { OnCieEvent, OnCieError } from "./WebViewComponent";
import { CieError, CieErrorType } from "./error";
import { CieEvent } from "./event";

const BASE_UAT_URL = "https://collaudo.idserver.servizicie.interno.gov.it/idp/";

export type ContinueWithUrl = (callbackUrl: string) => void;

export const startCieAndroid = async (
  useCieUat: boolean,
  ciePin: string,
  onError: OnCieError,
  onEvent: OnCieEvent,
  cieAuthorizationUri: string,
  continueWithUrl: ContinueWithUrl
) => {
  try {
    cieManager.removeAllListeners();
    cieManager
      .start()
      .then(async () => {
        cieManager.onEvent(handleCieEvent(onError, onEvent));
        cieManager.onError((e: Error) =>
          onError(new CieError({ message: e.message }))
        );
        cieManager.onSuccess(handleCieSuccess(continueWithUrl));
        await cieManager.setPin(ciePin);
        cieManager.setAuthenticationUrl(cieAuthorizationUri);
        cieManager.enableLog(useCieUat);
        cieManager.setCustomIdpUrl(useCieUat ? getCieUatEndpoint() : null);
        await cieManager.startListeningNFC();
        onEvent(CieEvent.waiting_card);
      })
      .catch(onError);
  } catch (e) {
    onError(
      new CieError({
        message: `Unable to start CIE NFC manager on Android: ${e}`,
        type: CieErrorType.NFC_ERROR
      })
    );
  }
};

export const startCieiOS = async (
  useCieUat: boolean,
  ciePin: string,
  onError: OnCieError,
  onEvent: OnCieEvent,
  cieAuthorizationUri: string,
  continueWithUrl: ContinueWithUrl
) => {
  try {
    cieManager.removeAllListeners();
    cieManager.onEvent(handleCieEvent(onError, onEvent));
    cieManager.onError((e: Error) =>
      onError(new CieError({ message: e.message }))
    );
    cieManager.onSuccess(handleCieSuccess(continueWithUrl));
    cieManager.enableLog(useCieUat);
    cieManager.setCustomIdpUrl(useCieUat ? getCieUatEndpoint() : null);
    await cieManager.setPin(ciePin);
    cieManager.setAuthenticationUrl(cieAuthorizationUri);
    cieManager
      .start()
      .then(async () => {
        await cieManager.startListeningNFC();
        onEvent(CieEvent.waiting_card);
      })
      .catch(onError);
  } catch (e) {
    onError(
      new CieError({
        message: `Unable to start CIE NFC manager on iOS: ${e}`,
        type: CieErrorType.NFC_ERROR
      })
    );
  }
};

const handleCieEvent =
  (onError: OnCieError, onEvent: OnCieEvent) => (event: CEvent) => {
    switch (event.event) {
      // Reading starts
      case "ON_TAG_DISCOVERED":
        onEvent(CieEvent.reading);
        break;
      // "Function not supported" seems to be TAG_ERROR_NFC_NOT_SUPPORTED
      // for the iOS SDK
      case "Function not supported" as unknown:
      case "TAG_ERROR_NFC_NOT_SUPPORTED":
      case "ON_TAG_DISCOVERED_NOT_CIE":
        onError(
          new CieError({
            message: `Invalid CIE card:  ${event.event}`,
            type: CieErrorType.TAG_NOT_VALID
          })
        );
        break;
      case "AUTHENTICATION_ERROR":
      case "ON_NO_INTERNET_CONNECTION":
        onError(
          new CieError({
            message: `Authentication error or no internet connection`,
            type: CieErrorType.AUTHENTICATION_ERROR
          })
        );
        break;
      case "EXTENDED_APDU_NOT_SUPPORTED":
        onError(
          new CieError({
            message: `APDU not supported`,
            type: CieErrorType.NFC_ERROR
          })
        );
        break;
      case "Transmission Error":
      case "ON_TAG_LOST":
        onError(
          new CieError({
            message: `Trasmission error`,
            type: CieErrorType.NFC_ERROR
          })
        );
        break;

      // The card is temporarily locked. Unlock is available by CieID app
      case "PIN Locked":
      case "ON_CARD_PIN_LOCKED":
        onError(
          new CieError({
            message: `PIN locked`,
            type: CieErrorType.PIN_LOCKED
          })
        );
        break;
      case "ON_PIN_ERROR":
        onError(
          new CieError({
            message: `PIN locked`,
            type: CieErrorType.PIN_ERROR,
            attemptsLeft: event.attemptsLeft
          })
        );
        break;

      // CIE is Expired or Revoked
      case "CERTIFICATE_EXPIRED":
        onError(
          new CieError({
            message: `Certificate expired`,
            type: CieErrorType.CERTIFICATE_ERROR
          })
        );
        break;
      case "CERTIFICATE_REVOKED":
        onError(
          new CieError({
            message: `Certificate revoked`,
            type: CieErrorType.CERTIFICATE_ERROR
          })
        );

        break;

      default:
        break;
    }
  };

const handleCieSuccess =
  (continueWithUrl: ContinueWithUrl) => (url: string) => {
    continueWithUrl(decodeURIComponent(url));
  };

const getCieUatEndpoint = () =>
  Platform.select({
    ios: `${BASE_UAT_URL}Authn/SSL/Login2`,
    android: BASE_UAT_URL,
    default: null
  });
