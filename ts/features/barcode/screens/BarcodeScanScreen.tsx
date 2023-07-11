import { useNavigation } from "@react-navigation/native";
import React from "react";
import { SafeAreaView } from "react-native";
import { VSpacer } from "../../../components/core/spacer/Spacer";
import ListItemNav from "../../../components/ui/ListItemNav";
import { useOpenDeepLink } from "../../../hooks/useOpenDeepLink";
import I18n from "../../../i18n";
import {
  AppParamsList,
  IOStackNavigationProp
} from "../../../navigation/params/AppParamsList";
import { useIOBottomSheetAutoresizableModal } from "../../../utils/hooks/bottomSheet";
import { IDPayPaymentRoutes } from "../../idpay/payment/navigation/navigator";
import { BarcodeScanBaseScreenComponent } from "../components/BarcodeScanBaseScreenComponent";
import { IOBarcode } from "../types/IOBarcode";
import { useIODispatch } from "../../../store/hooks";
import { paymentInitializeState } from "../../../store/actions/wallet/payment";
import {
  navigateToPaymentManualDataInsertion,
  navigateToPaymentTransactionSummaryScreen
} from "../../../store/actions/navigation";
import ROUTES from "../../../navigation/routes";
import { Divider } from "../../../components/core/Divider";

const BarcodeScanScreen = () => {
  const navigation = useNavigation<IOStackNavigationProp<AppParamsList>>();
  const dispatch = useIODispatch();
  const openDeepLink = useOpenDeepLink();

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
          paymentStartOrigin: "qrcode_scan"
        });
        break;
      default:
        handleBarcodeError();
        break;
    }
  };

  const handleBarcodeError = () => {
    alert("Invalid barcode :(");
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

  const filePickerModalComponent = (
    <SafeAreaView>
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
    </SafeAreaView>
  );

  const manualInputModal = useIOBottomSheetAutoresizableModal({
    component: filePickerModalComponent,
    title: ""
  });

  return (
    <>
      <BarcodeScanBaseScreenComponent
        formats={["QR_CODE", "DATA_MATRIX"]}
        onBarcodeSuccess={handleBarcodeSuccess}
        onBarcodeError={handleBarcodeError}
        onManualInputPressed={manualInputModal.present}
      />
      {manualInputModal.bottomSheet}
    </>
  );
};

export { BarcodeScanScreen };
