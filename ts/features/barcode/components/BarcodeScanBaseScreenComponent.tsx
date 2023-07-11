import { useIsFocused, useNavigation } from "@react-navigation/native";
import React from "react";
import { StatusBar, StyleSheet, View } from "react-native";
import LinearGradient from "react-native-linear-gradient";
import I18n from "../../../i18n";

import { IOColors } from "../../../components/core/variables/IOColors";
import { BaseHeader } from "../../../components/screens/BaseHeader";
import IconButton from "../../../components/ui/IconButton";
import {
  AppParamsList,
  IOStackNavigationProp
} from "../../../navigation/params/AppParamsList";
import { useIOBarcodeFileReader } from "../hooks/useIOBarcodeFileReader";
import { useIOBarcodeScanner } from "../hooks/useIOBarcodeScanner";
import { IOBarcode, IOBarcodeFormat } from "../types/IOBarcode";
import { BottomTabNavigation } from "./BottomTabNavigation";
import { CameraPermissionView } from "./CameraPermissionView";

type Props = {
  /**
   * Accepted formats of barcodes
   */
  formats: Array<IOBarcodeFormat>;
  /**
   * Callback called when a barcode is successfully decoded
   */
  onBarcodeSuccess: (barcode: IOBarcode) => void;
  /**
   * Callback called when a barcode is not successfully decoded
   */
  onBarcodeError: () => void;
  /**
   * Callback called when the manual input button is pressed
   * necessary to navigate to the manual input screen or show the manual input modal
   */
  onManualInputPressed: () => void;
};

const BarcodeScanBaseScreenComponent = (props: Props) => {
  const { formats, onBarcodeSuccess, onBarcodeError, onManualInputPressed } =
    props;
  const isFocused = useIsFocused();

  const handleBackNavigation = () => {
    navigation.goBack();
  };

  const navigation = useNavigation<IOStackNavigationProp<AppParamsList>>();

  const {
    cameraComponent,
    cameraPermissionStatus,
    requestCameraPermission,
    openCameraSettings
  } = useIOBarcodeScanner({
    onBarcodeSuccess,
    onBarcodeError,
    formats,
    disabled: !isFocused
  });

  const { showFilePicker, filePickerBottomSheet } = useIOBarcodeFileReader({
    formats,
    onBarcodeSuccess,
    onBarcodeError
  });

  const customGoBack = (
    <IconButton
      icon="closeLarge"
      onPress={handleBackNavigation}
      accessibilityLabel={I18n.t("global.buttons.close")}
      color="contrast"
    />
  );

  const openAppSetting = React.useCallback(async () => {
    // Open the custom settings if the app has one
    await openCameraSettings();
  }, [openCameraSettings]);

  const renderCameraView = () => {
    if (cameraPermissionStatus === "authorized") {
      return cameraComponent;
    }

    if (cameraPermissionStatus === "not-determined") {
      return (
        <CameraPermissionView
          title={I18n.t(
            "idpay.payment.qrCode.scan.permissions.undefined.title"
          )}
          body={I18n.t("idpay.payment.qrCode.scan.permissions.undefined.label")}
          action={{
            label: I18n.t(
              "idpay.payment.qrCode.scan.permissions.undefined.action"
            ),
            accessibilityLabel: I18n.t(
              "idpay.payment.qrCode.scan.permissions.undefined.action"
            ),
            onPress: requestCameraPermission
          }}
        />
      );
    }

    return (
      <CameraPermissionView
        title={I18n.t("idpay.payment.qrCode.scan.permissions.denied.title")}
        body={I18n.t("idpay.payment.qrCode.scan.permissions.denied.label")}
        action={{
          label: I18n.t("idpay.payment.qrCode.scan.permissions.denied.action"),
          accessibilityLabel: I18n.t(
            "idpay.payment.qrCode.scan.permissions.denied.action"
          ),
          onPress: openAppSetting
        }}
      />
    );
  };

  return (
    <View style={styles.screen}>
      <View style={styles.cameraContainer}>{renderCameraView()}</View>
      <BottomTabNavigation
        onUploadBarcodePressed={showFilePicker}
        onNavigateToCodeInputScreenPressed={onManualInputPressed}
      />
      <LinearGradient
        colors={["#03134480", "#03134400"]}
        style={styles.headerContainer}
      >
        <BaseHeader
          backgroundColor={"transparent"}
          goBack={true}
          customGoBack={customGoBack}
        />
        {/* This overrides BaseHeader status bar configuration */}
        <StatusBar
          barStyle={"light-content"}
          backgroundColor={"transparent"}
          translucent={true}
        />
      </LinearGradient>
      {filePickerBottomSheet}
    </View>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: IOColors["blueIO-850"]
  },
  headerContainer: {
    flex: 1,
    position: "absolute",
    width: "100%",
    height: 160
  },
  cameraContainer: {
    flex: 1,
    flexGrow: 1,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden"
  }
});

export { BarcodeScanBaseScreenComponent };
