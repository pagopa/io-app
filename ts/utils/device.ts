/**
 * util file to expose those functions that get or set data from/to device
 * regardless of the specific library used
 */
import DeviceInfo from "react-native-device-info";

export const getDeviceId = (): string => DeviceInfo.getUniqueId();

export const getFontScale = (): Promise<number> => DeviceInfo.getFontScale();
