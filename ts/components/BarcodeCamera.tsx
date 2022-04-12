import "react-native-reanimated";
import React, { useMemo } from "react";
import { Camera, useCameraDevices } from "react-native-vision-camera";
import { View, Text } from "react-native";
import { useScanBarcodes, BarcodeFormat } from "vision-camera-code-scanner";

export const BarcodeCamera = () => {
  const devices = useCameraDevices();
  const device = devices.back;

  const [frameProcessor, barcodes] = useScanBarcodes(
    [BarcodeFormat.QR_CODE, BarcodeFormat.DATA_MATRIX],
    {
      checkInverted: true
    }
  );

  const serializedBarcodes = useMemo(
    () =>
      barcodes[0] ? `${barcodes[0].content.data}`.slice(0, 20) + "..." : "",
    [barcodes]
  );

  return (
    <View style={{ width: "100%", height: 400 }}>
      {device && (
        <Camera
          style={{ width: "100%", height: "100%" }}
          device={device}
          isActive={true}
          frameProcessor={frameProcessor}
          frameProcessorFps={5}
        />
      )}

      <View style={{ marginTop: 15 }}>
        <Text>{serializedBarcodes}</Text>
      </View>
    </View>
  );
};
