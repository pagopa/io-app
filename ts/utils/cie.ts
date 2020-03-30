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
