import React from "react";
import { Dimensions, Linking, StyleSheet, View } from "react-native";
import {
  Camera,
  CameraPermissionStatus,
  useCameraDevices
} from "react-native-vision-camera";
import { BarcodeFormat, useScanBarcodes } from "vision-camera-code-scanner";
import { IOColors } from "../../../../components/core/variables/IOColors";
import customVariables from "../../../../theme/variables";

type QRCodeCameraConfiguration = {
  marker?: React.ReactNode;
  fullHeight?: boolean;
  onQrCodeScanned?: (content: string) => void;
};

type QRCodeCamera = {
  cameraComponent: React.ReactNode;
  cameraPermissionStatus: CameraPermissionStatus;
  requestCameraPermission: () => Promise<void>;
  openCameraSettings: () => Promise<void>;
};

const DEFAULT_CONFIGURATION: QRCodeCameraConfiguration = {};

const useQRCodeCamera = (
  config: QRCodeCameraConfiguration = DEFAULT_CONFIGURATION
): QRCodeCamera => {
  const { marker, fullHeight, onQrCodeScanned } = config;

  const devices = useCameraDevices();
  const [cameraPermissionStatus, setCameraPermissionStatus] =
    React.useState<CameraPermissionStatus>("not-determined");
  const [frameProcessor, barcodes] = useScanBarcodes([BarcodeFormat.QR_CODE], {
    checkInverted: true
  });

  React.useEffect(() => {
    Camera.getCameraPermissionStatus()
      .then(setCameraPermissionStatus)
      .catch(() => setCameraPermissionStatus("not-determined"));
  }, []);

  const requestCameraPermission = async () => {
    const permissions = await Camera.requestCameraPermission();
    setCameraPermissionStatus(permissions);
  };

  const openCameraSettings = async () => {
    await Linking.openSettings();
    const permissions = await Camera.getCameraPermissionStatus();
    setCameraPermissionStatus(permissions);
  };

  React.useEffect(() => {
    if (barcodes.length !== 0) {
      onQrCodeScanned?.(barcodes[0].content.data.toString());
    }
  }, [barcodes, onQrCodeScanned]);

  const cameraComponent = (
    <View
      style={[
        styles.cameraContainer,
        fullHeight && styles.fullHeightCameraContainer
      ]}
    >
      {devices.back && (
        <Camera
          style={styles.camera}
          device={devices.back}
          audio={false}
          frameProcessor={frameProcessor}
          frameProcessorFps={5}
          isActive={true}
        />
      )}

      {marker && <View style={{ alignSelf: "center" }}>{marker}</View>}
    </View>
  );

  return {
    cameraComponent,
    cameraPermissionStatus,
    requestCameraPermission,
    openCameraSettings
  };
};

const screenWidth = Dimensions.get("screen").width;

const styles = StyleSheet.create({
  cameraContainer: {
    position: "relative",
    width: "100%",
    height: screenWidth,
    backgroundColor: IOColors.black
  },

  fullHeightCameraContainer: {
    height: "100%"
  },

  camera: {
    position: "absolute",
    width: "100%",
    height: "100%"
  },

  notAuthorizedContainer: {
    padding: customVariables.contentPadding,
    flex: 1,
    alignItems: "center",
    alignSelf: "stretch",
    marginBottom: 14
  },

  notAuthorizedText: {
    marginBottom: 25
  },

  notAuthorizedBtn: {
    flex: 1,
    alignSelf: "stretch"
  }
});

export type { QRCodeCamera };
export { useQRCodeCamera };
