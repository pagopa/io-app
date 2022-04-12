import React from "react";
import { Camera, useCameraDevices } from "react-native-vision-camera";
import { View } from "react-native";

export const BarcodeCamera = () => {
  const devices = useCameraDevices();
  const device = devices.back;

  return (
    <View style={{ width: "100%", height: 400 }}>
      {device && (
        <Camera
          style={{ width: "100%", height: "100%" }}
          device={device}
          isActive={true}
        />
      )}
    </View>
  );
};
