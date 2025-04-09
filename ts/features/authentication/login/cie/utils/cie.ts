import cieSdk from "@pagopa/react-native-cie";
import { Platform } from "react-native";

const realIsNfcEnabled = () => cieSdk.isNFCEnabled();
const mockIsNfcEnabled = () => Promise.resolve(true);

const realOpenNfcSettings = cieSdk.openNFCSettings;
const mockOpenNfcSettings = () => Promise.resolve();

const test = Platform.OS !== "android";

export const isNfcEnabled = test ? mockIsNfcEnabled : realIsNfcEnabled;
export const openNFCSettings = test ? mockOpenNfcSettings : realOpenNfcSettings;

export const IO_LOGIN_CIE_SOURCE_APP = "iologincie";
export const IO_LOGIN_CIE_URL_SCHEME = `${IO_LOGIN_CIE_SOURCE_APP}:`;
export const CIE_ID_ERROR = "cieiderror";
export const CIE_ID_ERROR_MESSAGE = "cieid_error_message=";
