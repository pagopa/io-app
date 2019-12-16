// Check min version app supported
export const isVersionAppSupported = (
  minAppVersion: string | undefined,
  DeviceVersion: string
): boolean => {
  // If the backend-info is not available (es. request http error) continue to use app
  if (minAppVersion !== undefined) {
    return parseFloat(minAppVersion) <= parseFloat(DeviceVersion);
  } else {
    return true;
  }
};
