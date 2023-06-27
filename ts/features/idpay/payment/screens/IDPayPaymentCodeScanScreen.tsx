import { useIsFocused, useNavigation } from "@react-navigation/native";
import React from "react";
import { SafeAreaView, StatusBar, StyleSheet, View } from "react-native";
import RNReactNativeHapticFeedback from "react-native-haptic-feedback";
import LinearGradient from "react-native-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import CameraScanMarkerSVG from "../../../../../img/camera-scan-marker.svg";
import { IOColors } from "../../../../components/core/variables/IOColors";
import IconButton from "../../../../components/ui/IconButton";
import I18n from "../../../../i18n";
import {
  AppParamsList,
  IOStackNavigationProp
} from "../../../../navigation/params/AppParamsList";
import { openWebUrl } from "../../../../utils/url";
import { IOBarcode, useIOBarcodeScanner } from "../components/Barcode";
import { BottomTabNavigation } from "../components/BottomTabNavigation";
import { CameraPermissionView } from "../components/CameraPermissionView";

const IDPayPaymentCodeScanScreen = () => {
  const isFocused = useIsFocused();

  const handleBarcodeScanned = (barcode: IOBarcode) => {
    if (barcode.type === "IDPAY") {
      RNReactNativeHapticFeedback.trigger("notificationSuccess", {
        enableVibrateFallback: true,
        ignoreAndroidSystemSettings: false
      });
      openWebUrl(barcode.authUrl);
    }
  };

  const cameraMarkerComponent = (
    <View style={styles.cameraMarkerContainer}>
      <CameraScanMarkerSVG width={230} height={230} />
    </View>
  );

  const {
    cameraComponent,
    cameraPermissionStatus,
    requestCameraPermission,
    openCameraSettings
  } = useIOBarcodeScanner({
    marker: cameraMarkerComponent,
    onBarcodeScanned: handleBarcodeScanned,
    formats: ["QR_CODE"],
    disabled: !isFocused
  });

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
      <BottomTabNavigation />
      <LinearGradient
        colors={["#03134480", "#03134400"]}
        style={styles.headerContainer}
      >
        <StatusBar
          barStyle={"light-content"}
          backgroundColor={"transparent"}
          translucent={true}
        />
        {/* FIXME replace with the new header from the Design System 2.0  */}
        <CustomHeader />
      </LinearGradient>
    </View>
  );
};

const CustomHeader = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<IOStackNavigationProp<AppParamsList>>();

  const handleBackNavigation = () => {
    navigation.goBack();
  };

  return (
    <SafeAreaView style={{ marginHorizontal: 8, marginTop: insets.top }}>
      <View
        style={{
          paddingVertical: 16,
          paddingHorizontal: 24,
          flex: 1,
          flexDirection: "row",
          justifyContent: "space-between"
        }}
      >
        <View>
          <IconButton
            icon="closeLarge"
            onPress={handleBackNavigation}
            accessibilityLabel={I18n.t("global.buttons.close")}
            color="contrast"
          />
        </View>
      </View>
    </SafeAreaView>
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
  },
  cameraMarkerContainer: {
    width: "100%",
    height: "105%",
    justifyContent: "center"
  }
});

export { IDPayPaymentCodeScanScreen };
