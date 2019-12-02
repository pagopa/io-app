import cieSdk from "react-native-cie";

const realIsCIEAuthenticationSupported = cieSdk.isCIEAuthenticationSupported;
const mockIsCIEAuthenticationSupported = () => Promise.resolve(true);

const realIsNfcEnabled = cieSdk.isNFCEnabled;
const mockIsNfcEnabled = () => Promise.resolve(false);

const ios = true;

export const isCIEAuthenticationSupported = ios
  ? mockIsCIEAuthenticationSupported
  : realIsCIEAuthenticationSupported;

export const isNfcEnabled = ios ? mockIsNfcEnabled : realIsNfcEnabled;
