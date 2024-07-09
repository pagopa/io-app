import React from "react";
import {
  Camera,
  CameraDevice,
  useCameraDevice
} from "react-native-vision-camera";

/**
 * This function returns the best match of back camera, excuding the ultra-wide-camera
 * @param devices Array of {@see CameraDevice}
 * @returns A {@see CameraDevice} or undefined, if a valid camera cannot be found
 */
const getWideAngleCameraOrDefault = (
  devices: Array<CameraDevice>
): CameraDevice | undefined => {
  const defaultBackDevice = devices.find(d => d.position === "back");
  const wideAngleDevice = devices.find(
    d =>
      d.position !== "front" &&
      !d.physicalDevices.includes("ultra-wide-angle-camera")
  );
  return wideAngleDevice || defaultBackDevice;
};

/**
 * This hook tries to return a react-native-vision-camera with
 * wide-angle-camera format. If not present, returns the default one as fallback
 * FIXME: remove this when react-native-vision-camera is updated to 3.x
 */
const useWideAngleCameraDevice = (): CameraDevice | undefined =>
  useCameraDevice("back", {
    physicalDevices: ["ultra-wide-angle-camera"]
  });
// const [device, setDevice] = React.useState<CameraDevice>();

// React.useEffect(() => {
//   const devices = Camera.getAvailableCameraDevices();
//   const bestMatchDevice = getWideAngleCameraOrDefault(devices);
//   setDevice(bestMatchDevice);
// }, []);

export { useWideAngleCameraDevice };
