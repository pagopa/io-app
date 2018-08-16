import * as DeviceInfo from "react-native-device-info";

export const APP_NAME = "ItaliaApp";

export const PIN_LENGTH = 5;

export const VERSION: string = DeviceInfo.getReadableVersion();

// A key to identify the Set of the listeners of the navigtion middleware.
export const NAVIGATION_MIDDLEWARE_LISTENERS_KEY: string = "root";
