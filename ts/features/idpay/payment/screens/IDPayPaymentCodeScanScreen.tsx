import { useNavigation } from "@react-navigation/native";
import React from "react";
import { SafeAreaView, StyleSheet, View } from "react-native";
import { TouchableOpacity } from "react-native-gesture-handler";
import LinearGradient from "react-native-linear-gradient";
import CameraScanOverlaySVG from "../../../../../img/camera-scan-overlay.svg";
import {
  BarcodeCamera,
  ScannedBarcode
} from "../../../../components/BarcodeCamera";
import { ContentWrapper } from "../../../../components/core/ContentWrapper";
import { LabelSmall } from "../../../../components/core/typography/LabelSmall";
import { IOColors } from "../../../../components/core/variables/IOColors";
import { BaseHeader } from "../../../../components/screens/BaseHeader";
import IconButton from "../../../../components/ui/IconButton";
import {
  AppParamsList,
  IOStackNavigationProp
} from "../../../../navigation/params/AppParamsList";
import { IDPayPaymentRoutes } from "../navigation/navigator";
import I18n from "../../../../i18n";

const IDPayPaymentCodeScanScreen = () => {
  const onBarcodeScanned = (barcode: ScannedBarcode) => {
    alert(`trxCode: ${barcode.value}`);
  };

  return (
    <View style={styles.screen}>
      <View style={styles.cameraContainer}>
        <BarcodeCamera
          onBarcodeScanned={onBarcodeScanned}
          marker={<CameraMarker />}
        />
      </View>
      <SafeAreaView style={styles.navigationContainer}>
        <TabNavigation />
      </SafeAreaView>
      <LinearGradient
        colors={["#03134480", "#03134400"]}
        style={styles.headerContainer}
      >
        {/* TODO eplace with the new header from the Design System 2.0  */}
        <CustomHeader />
      </LinearGradient>
    </View>
  );
};

const CustomHeader = () => {
  const navigation = useNavigation<IOStackNavigationProp<AppParamsList>>();

  const customGoBack = (
    <IconButton
      icon="close"
      onPress={() => {
        navigation.goBack();
      }}
      accessibilityLabel={I18n.t("global.buttons.close")}
      color="contrast"
    />
  );

  return (
    <BaseHeader customGoBack={customGoBack} backgroundColor={"transparent"} />
  );
};

const CameraMarker = () => (
  <View style={styles.cameraMarker}>
    <CameraScanOverlaySVG width={230} height={230} />
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
            {I18n.t("idpay.payment.qrCode.scan.tabs.upload")}
          </LabelSmall>
        </TouchableOpacity>
      </View>
    </ContentWrapper>
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
    backgroundColor: IOColors["blueIO-50"],
    flex: 1,
    flexGrow: 1,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden"
  },
  cameraMarker: {
    width: "100%",
    height: "105%",
    justifyContent: "center"
  },
  navigationContainer: {
    backgroundColor: IOColors["blueIO-850"],
    margin: 8
  },
  navigationTabs: {
    paddingVertical: 32,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center"
  },
  tab: {
    width: 100,
    alignItems: "center",
    paddingVertical: 8
  },
  tabActive: {
    backgroundColor: IOColors.white,
    borderRadius: 85
  }
});

export { IDPayPaymentCodeScanScreen };
