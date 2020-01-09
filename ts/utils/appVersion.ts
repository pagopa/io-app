// Check min version app supported
export const isVersionAppSupported = (
  minAppVersion: string | undefined,
  DeviceVersion: string
): boolean => {
  if (minAppVersion && DeviceVersion) {
    return true;
  }
  return false;
};
