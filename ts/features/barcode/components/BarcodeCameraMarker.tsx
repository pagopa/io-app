import React from "react";
import { StyleSheet, View } from "react-native";
import CameraScanMarkerSVG from "../../../../img/camera-scan-marker.svg";

const BarcodeCameraMarker = () => (
  <View style={styles.cameraMarkerContainer}>
    <CameraScanMarkerSVG width={230} height={230} />
  </View>
);

const styles = StyleSheet.create({
  cameraMarkerContainer: {
    width: "100%",
    height: "105%",
    justifyContent: "center"
  }
});

export { BarcodeCameraMarker };
