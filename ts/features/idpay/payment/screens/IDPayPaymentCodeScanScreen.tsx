import { useNavigation } from "@react-navigation/native";
import React from "react";
import { SafeAreaView, StatusBar, StyleSheet, View } from "react-native";
import { TouchableOpacity } from "react-native-gesture-handler";
import LinearGradient from "react-native-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import CameraScanMarkerSVG from "../../../../../img/camera-scan-marker.svg";
import { ContentWrapper } from "../../../../components/core/ContentWrapper";
import { Pictogram } from "../../../../components/core/pictograms";
import { VSpacer } from "../../../../components/core/spacer/Spacer";
import { H3 } from "../../../../components/core/typography/H3";
import { LabelSmall } from "../../../../components/core/typography/LabelSmall";
import { IOColors } from "../../../../components/core/variables/IOColors";
import ButtonSolid from "../../../../components/ui/ButtonSolid";
import IconButton from "../../../../components/ui/IconButton";
import I18n from "../../../../i18n";
import {
  AppParamsList,
  IOStackNavigationProp
} from "../../../../navigation/params/AppParamsList";
import { openWebUrl } from "../../../../utils/url";
import { IOBarcode, useIOBarcodeScanner } from "../components/BarcodeScanner";
import { IDPayPaymentRoutes } from "../navigation/navigator";

const IDPayPaymentCodeScanScreen = () => {
  const navigation = useNavigation();

  const [isFocused, setIsFocused] = React.useState<boolean>(false);

  React.useEffect(() => {
    const blurUnsubscribe = navigation.addListener("blur", () =>
      setIsFocused(false)
    );
    const focusUnsubscribe = navigation.addListener("focus", () =>
      setIsFocused(true)
    );

    return () => {
      blurUnsubscribe();
      focusUnsubscribe();
    };
  }, [navigation]);

  const {
    cameraComponent,
    cameraPermissionStatus,
    requestCameraPermission,
    openCameraSettings
  } = useIOBarcodeScanner({
    marker: <CameraMarker />,
    onBarcodeScanned: (barcode: IOBarcode) => openWebUrl(barcode.value),
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
        <View style={styles.permissionView}>
          <Pictogram name="cameraRequest" />
          <VSpacer size={24} />
          <H3 color="white">
            {I18n.t("idpay.payment.qrCode.scan.permissions.undefined.title")}
          </H3>
          <VSpacer size={8} />
          <LabelSmall
            weight="Regular"
            color="white"
            style={{ textAlign: "center" }}
          >
            {I18n.t("idpay.payment.qrCode.scan.permissions.undefined.label")}
          </LabelSmall>
          <VSpacer size={32} />
          <ButtonSolid
            label={I18n.t(
              "idpay.payment.qrCode.scan.permissions.undefined.action"
            )}
            accessibilityLabel={I18n.t(
              "idpay.payment.qrCode.scan.permissions.undefined.action"
            )}
            onPress={requestCameraPermission}
            color="contrast"
            fullWidth={true}
          />
        </View>
      );
    }

    return (
      <View style={styles.permissionView}>
        <Pictogram name="cameraRequest" />
        <VSpacer size={24} />
        <H3 color="white">
          {I18n.t("idpay.payment.qrCode.scan.permissions.denied.title")}
        </H3>
        <VSpacer size={8} />
        <LabelSmall
          weight="Regular"
          color="white"
          style={{ textAlign: "center" }}
        >
          {I18n.t("idpay.payment.qrCode.scan.permissions.denied.label")}
        </LabelSmall>
        <VSpacer size={32} />
        <ButtonSolid
          label={I18n.t("idpay.payment.qrCode.scan.permissions.denied.action")}
          accessibilityLabel={I18n.t(
            "idpay.payment.qrCode.scan.permissions.denied.action"
          )}
          onPress={openAppSetting}
          color="contrast"
          fullWidth={true}
        />
      </View>
    );
  };

  return (
    <View style={styles.screen}>
      <View style={styles.cameraContainer}>{renderCameraView()}</View>
      <TabNavigation />
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
            icon="close"
            onPress={handleBackNavigation}
            accessibilityLabel={I18n.t("global.buttons.close")}
            color="contrast"
          />
        </View>
      </View>
    </SafeAreaView>
  );
};

const CameraMarker = () => (
  <View style={styles.cameraMarkerContainer}>
    <CameraScanMarkerSVG width={230} height={230} />
  </View>
);

const TabNavigation = () => {
  const navigation = useNavigation<IOStackNavigationProp<AppParamsList>>();

  const navigateToCodeInputScreen = () =>
    navigation.navigate(IDPayPaymentRoutes.IDPAY_PAYMENT_MAIN, {
      screen: IDPayPaymentRoutes.IDPAY_PAYMENT_CODE_INPUT
    });

  const showUploadModal = () => {
    // TODO QRCode upload will be handled in another PR
    alert("TODO 😄");
  };

  return (
    <SafeAreaView style={styles.navigationContainer}>
      <ContentWrapper>
        <View style={styles.navigationTabs}>
          <View style={[styles.tab, styles.tabActive]}>
            <LabelSmall color="grey-850" weight="Regular">
              {I18n.t("idpay.payment.qrCode.scan.tabs.scan")}
            </LabelSmall>
          </View>
          <TouchableOpacity style={styles.tab} onPress={showUploadModal}>
            <LabelSmall color="white" weight="Regular">
              {I18n.t("idpay.payment.qrCode.scan.tabs.upload")}
            </LabelSmall>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.tab}
            onPress={navigateToCodeInputScreen}
          >
            <LabelSmall color="white" weight="Regular">
              {I18n.t("idpay.payment.qrCode.scan.tabs.input")}
            </LabelSmall>
          </TouchableOpacity>
        </View>
      </ContentWrapper>
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
  },
  navigationContainer: {
    backgroundColor: IOColors["blueIO-850"],
    margin: 8
  },
  navigationTabs: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 24
  },
  tab: {
    width: 100,
    alignItems: "center",
    paddingVertical: 8
  },
  tabActive: {
    backgroundColor: IOColors.white,
    borderRadius: 85
  },
  permissionView: {
    marginHorizontal: 32,
    alignItems: "center"
  }
});

export { IDPayPaymentCodeScanScreen };
