import cieSdk from "@pagopa/io-react-native-cie-pid";
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

export const itwIsCIEAuthenticationSupported = test
  ? mockIsCIEAuthenticationSupported
  : realIsCIEAuthenticationSupported;

export const itwIsNfcEnabled = test ? mockIsNfcEnabled : realIsNfcEnabled;
export const itwOpenNFCSettings = test
  ? mockOpenNfcSettings
  : realOpenNfcSettings;
export const itwLaunchCieID = test ? mockLaunchCieID : realLaunchCieID;
