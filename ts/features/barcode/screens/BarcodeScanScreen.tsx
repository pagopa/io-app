import { useNavigation } from "@react-navigation/native";
import React from "react";
import { View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Divider } from "../../../components/core/Divider";
import { VSpacer } from "../../../components/core/spacer/Spacer";
import ListItemNav from "../../../components/ui/ListItemNav";
import { useOpenDeepLink } from "../../../hooks/useOpenDeepLink";
import I18n from "../../../i18n";
import {
  AppParamsList,
  IOStackNavigationProp
} from "../../../navigation/params/AppParamsList";
import ROUTES from "../../../navigation/routes";
import { navigateToPaymentTransactionSummaryScreen } from "../../../store/actions/navigation";
import { paymentInitializeState } from "../../../store/actions/wallet/payment";
import { useIODispatch, useIOSelector } from "../../../store/hooks";
import { barcodesScannerConfigSelector } from "../../../store/reducers/backendStatus";
import { useIOBottomSheetAutoresizableModal } from "../../../utils/hooks/bottomSheet";
import * as Platform from "../../../utils/platform";
import { showToast } from "../../../utils/showToast";
import { IDPayPaymentRoutes } from "../../idpay/payment/navigation/navigator";
import { BarcodeScanBaseScreenComponent } from "../components/BarcodeScanBaseScreenComponent";
import { IOBarcode } from "../types/IOBarcode";

const BarcodeScanScreen = () => {
  const navigation = useNavigation<IOStackNavigationProp<AppParamsList>>();
  const dispatch = useIODispatch();
  const openDeepLink = useOpenDeepLink();
  const insets = useSafeAreaInsets();

  const { dataMatrixPosteEnabled } = useIOSelector(
    barcodesScannerConfigSelector
  );

  const handleBarcodeSuccess = (barcode: IOBarcode) => {
    switch (barcode.type) {
      case "IDPAY":
        openDeepLink(barcode.authUrl);
        break;
      case "PAGOPA":
        dispatch(paymentInitializeState());

        navigateToPaymentTransactionSummaryScreen({
          rptId: barcode.rptId,
          initialAmount: barcode.amount,
          paymentStartOrigin:
            barcode.format === "QR_CODE"
              ? "qrcode_scan"
              : "poste_datamatrix_scan"
        });
        break;
    }
  };

  const handleBarcodeError = () => {
    showToast(I18n.t("barcodeScan.error"), "danger", "top");
  };

  const handleIdPayPaymentCodeInput = () => {
    manualInputModal.dismiss();
    navigation.navigate(IDPayPaymentRoutes.IDPAY_PAYMENT_MAIN, {
      screen: IDPayPaymentRoutes.IDPAY_PAYMENT_CODE_INPUT
    });
  };

  const handlePagoPACodeInput = () => {
    manualInputModal.dismiss();
    navigation.navigate(ROUTES.WALLET_NAVIGATOR, {
      screen: ROUTES.PAYMENT_MANUAL_DATA_INSERTION,
      params: {}
    });
  };

  const manualInputModalComponent = (
    <View>
      <ListItemNav
        value={I18n.t("barcodeScan.manual.notice")}
        accessibilityLabel={I18n.t("barcodeScan.manual.notice")}
        onPress={handlePagoPACodeInput}
        icon="gallery"
      />
      <Divider />
      <ListItemNav
        value={I18n.t("barcodeScan.manual.authorize")}
        accessibilityLabel={I18n.t("barcodeScan.manual.authorize")}
        onPress={handleIdPayPaymentCodeInput}
        icon="gallery"
      />
      <VSpacer size={16} />
    </View>
  );

  const manualInputModal = useIOBottomSheetAutoresizableModal(
    {
      component: manualInputModalComponent,
      title: ""
    },
    // FIXME: This is a workaround to avoid the bottom sheet to be hidden on Android
    32 + (Platform.isAndroid ? insets.bottom : 0)
  );

  return (
    <>
      <BarcodeScanBaseScreenComponent
        formats={
          dataMatrixPosteEnabled ? ["QR_CODE", "DATA_MATRIX"] : ["QR_CODE"]
        }
        onBarcodeSuccess={handleBarcodeSuccess}
        onBarcodeError={handleBarcodeError}
        onManualInputPressed={manualInputModal.present}
      />
      {manualInputModal.bottomSheet}
    </>
  );
};

export { BarcodeScanScreen };
