import { ServerInfo } from "../../definitions/backend/ServerInfo";

// Check min version app supported
export const isVersionAppSupported = (
  backendInfo: ServerInfo | undefined,
  DeviceVersion: string
): boolean => {
  // If the backend-info is not available (es. request http error) continue to use app
  if (backendInfo !== undefined && backendInfo.minAppVersion !== undefined) {
    return parseFloat(backendInfo.minAppVersion) <= parseFloat(DeviceVersion);
  } else {
    return true;
  }
};
