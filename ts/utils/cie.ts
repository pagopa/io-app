import cieSdk from "@pagopa/react-native-cie";
import { Platform } from "react-native";

const realIsCIEAuthenticationSupported = cieSdk.isCIEAuthenticationSupported;
const mockIsCIEAuthenticationSupported = () => Promise.resolve(true);

const realIsNfcEnabled = () => cieSdk.isNFCEnabled();
const mockIsNfcEnabled = () => Promise.resolve(true);

const realOpenNfcSettings = cieSdk.openNFCSettings;
const mockOpenNfcSettings = () => Promise.resolve();

const realLaunchCieID = cieSdk.launchCieID;
const mockLaunchCieID = () => Promise.reject("ops");

const test = Platform.OS !== "android";

export const isCIEAuthenticationSupported = test
  ? mockIsCIEAuthenticationSupported
  : realIsCIEAuthenticationSupported;

export const isNfcEnabled = test ? mockIsNfcEnabled : realIsNfcEnabled;
export const openNFCSettings = test ? mockOpenNfcSettings : realOpenNfcSettings;
export const launchCieID = test ? mockLaunchCieID : realLaunchCieID;

export const IO_LOGIN_CIE_SOURCE_APP = "iologincie";
export const IO_LOGIN_CIE_URL_SCHEME = `${IO_LOGIN_CIE_SOURCE_APP}:`;
export const CIE_ID_ERROR = "cieiderror";
export const CIE_ID_ERROR_MESSAGE = "cieid_error_message=";
