import cieSdk from "react-native-cie";

const realIsCIEAuthenticationSupported = cieSdk.isCIEAuthenticationSupported;
const mockIsCIEAuthenticationSupported = () => Promise.resolve(true);

const realIsNfcEnabled = cieSdk.isNFCEnabled;
const mockIsNfcEnabled = () => Promise.resolve(false);

const realOpenNfcSettings = cieSdk.openNFCSettings;
const mockOpenNfcSettings = () => Promise.resolve();

const test = true;

export const isCIEAuthenticationSupported = test
  ? mockIsCIEAuthenticationSupported
  : realIsCIEAuthenticationSupported;

export const isNfcEnabled = test ? mockIsNfcEnabled : realIsNfcEnabled;

export const openNFCSettings = test ? mockOpenNfcSettings : realOpenNfcSettings;
