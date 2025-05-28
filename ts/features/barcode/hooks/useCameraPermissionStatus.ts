import { useIsFocused } from "@react-navigation/native";
import { useCallback, useEffect, useState } from "react";
import { AppState, Linking } from "react-native";
import { Camera, CameraPermissionStatus } from "react-native-vision-camera";
import { useIONavigation } from "../../../navigation/params/AppParamsList";
import { isAndroid } from "../../../utils/platform";

/**
 * Hook to handle camera permission status with platform specific behavior
 */
export const useCameraPermissionStatus = () => {
  const navigation = useIONavigation();
  const [cameraPermissionStatus, setCameraPermissionStatus] =
    useState<CameraPermissionStatus>();

  const isFocused = useIsFocused();
  const [isNavigationTransitionEnded, setIsNavigationTransitionEnded] =
    useState(false);

  /**
   * Opens the system prompt to ask camera permission
   */
  const requestCameraPermission = useCallback(async () => {
    const permissions = await Camera.requestCameraPermission();
    setCameraPermissionStatus(permissions);
  }, []);

  /**
   * Opens the system settings to allow user to change the camera permission
   */
  const openCameraSettings = useCallback(() => {
    void Linking.openSettings();
  }, []);

  /**
   * Checks the camera permission on mount
   *
   * **Note:** On android devices the app starts with a "denied" permission status,
   * which does not necessarily mean that the permission was denied by the user.
   * We need to request the permission to check if the user has denied it.
   */
  useEffect(() => {
    const permission = Camera.getCameraPermissionStatus();
    if (isAndroid && permission === "denied") {
      if (isFocused && isNavigationTransitionEnded) {
        void requestCameraPermission();
      }
    } else {
      setCameraPermissionStatus(permission);
    }
  }, [requestCameraPermission, isFocused, isNavigationTransitionEnded]);

  /**
   * Setup listener for app state changes to detect if camera permissions were granted
   * through system settings after the user returns to the app.
   */
  useEffect(() => {
    if (cameraPermissionStatus === "denied") {
      const unsubscribe = AppState.addEventListener("change", nextAppState => {
        if (nextAppState === "active") {
          const permission = Camera.getCameraPermissionStatus();
          setCameraPermissionStatus(permission);
        }
      });

      return () => unsubscribe.remove();
    }
    return () => null;
  }, [cameraPermissionStatus]);

  /**
   * Listener for navigation transition end to detect if the user has navigated
   * to the barcode screen and we can request the camera permission.
   */
  useEffect(
    () =>
      navigation.addListener("transitionEnd", () => {
        setIsNavigationTransitionEnded(true);
      }),
    [navigation]
  );

  return {
    cameraPermissionStatus,
    requestCameraPermission,
    openCameraSettings
  };
};
