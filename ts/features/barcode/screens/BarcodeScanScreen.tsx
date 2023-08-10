import { useNavigation } from "@react-navigation/native";
import * as A from "fp-ts/lib/Array";
import { pipe } from "fp-ts/lib/function";
import React from "react";
import { View } from "react-native";
import ReactNativeHapticFeedback, {
  HapticFeedbackTypes
} from "react-native-haptic-feedback";
import { IOToast } from "../../../components/Toast";
import { Divider } from "../../../components/core/Divider";
import { VSpacer } from "../../../components/core/spacer/Spacer";
import ListItemNav from "../../../components/ui/ListItemNav";
import { useOpenDeepLink } from "../../../hooks/useOpenDeepLink";
import I18n from "../../../i18n";
import { mixpanelTrack } from "../../../mixpanel";
import {
  AppParamsList,
  IOStackNavigationProp
} from "../../../navigation/params/AppParamsList";
import ROUTES from "../../../navigation/routes";
import { navigateToPaymentTransactionSummaryScreen } from "../../../store/actions/navigation";
import {
  PaymentStartOrigin,
  paymentInitializeState
} from "../../../store/actions/wallet/payment";
import { useIODispatch, useIOSelector } from "../../../store/hooks";
import {
  barcodesScannerConfigSelector,
  isIdPayEnabledSelector
} from "../../../store/reducers/backendStatus";
import { emptyContextualHelp } from "../../../utils/emptyContextualHelp";
import { useIOBottomSheetAutoresizableModal } from "../../../utils/hooks/bottomSheet";
import { IDPayPaymentRoutes } from "../../idpay/payment/navigation/navigator";
import { WalletPaymentRoutes } from "../../walletV3/payment/navigation/routes";
import { BarcodeScanBaseScreenComponent } from "../components/BarcodeScanBaseScreenComponent";
import {
  IOBarcode,
  IO_BARCODE_ALL_FORMATS,
  IO_BARCODE_ALL_TYPES,
  PagoPaBarcode
} from "../types/IOBarcode";

const BarcodeScanScreen = () => {
  const navigation = useNavigation<IOStackNavigationProp<AppParamsList>>();
  const dispatch = useIODispatch();
  const openDeepLink = useOpenDeepLink();
  const isIdPayEnabled = useIOSelector(isIdPayEnabledSelector);

  const { dataMatrixPosteEnabled } = useIOSelector(
    barcodesScannerConfigSelector
  );

  const handleMultiplePagoPaBarcodes = (
    pagoPaBarcodes: Array<PagoPaBarcode>
  ) => {
    const hasDataMatrix = pagoPaBarcodes.some(
      barcode => barcode.format === "DATA_MATRIX"
    );

    if (hasDataMatrix) {
      void mixpanelTrack("WALLET_SCAN_POSTE_DATAMATRIX_SUCCESS");
    }

    const paymentStartOrigin: PaymentStartOrigin = hasDataMatrix
      ? "poste_datamatrix_scan"
      : "qrcode_scan";

    if (pagoPaBarcodes.length > 1) {
      navigation.navigate(WalletPaymentRoutes.WALLET_PAYMENT_MAIN, {
        screen: WalletPaymentRoutes.WALLET_PAYMENT_BARCODE_CHOICE,
        params: {
          barcodes: pagoPaBarcodes,
          paymentStartOrigin
        }
      });
    }
  };

  const handleBarcodeSuccess = (barcodes: Array<IOBarcode>) => {
    const pagoPaBarcodes: Array<PagoPaBarcode> = pipe(
      barcodes,
      A.filter(barcode => barcode.type === "PAGOPA"),
      A.map(barcode => barcode as PagoPaBarcode)
    );

    if (pagoPaBarcodes.length > 1) {
      // Prioritize pagoPa barcodes
      handleMultiplePagoPaBarcodes(pagoPaBarcodes);
      return;
    }

    const barcode = barcodes[0];

    ReactNativeHapticFeedback.trigger(HapticFeedbackTypes.notificationSuccess);

    switch (barcode.type) {
      case "IDPAY":
        openDeepLink(barcode.authUrl);
        break;
      case "PAGOPA":
        dispatch(paymentInitializeState());

        const isDataMatrix = barcode.format === "DATA_MATRIX";

        if (isDataMatrix) {
          void mixpanelTrack("WALLET_SCAN_POSTE_DATAMATRIX_SUCCESS");
        }

        navigateToPaymentTransactionSummaryScreen({
          rptId: barcode.rptId,
          initialAmount: barcode.amount,
          paymentStartOrigin: isDataMatrix
            ? "poste_datamatrix_scan"
            : "qrcode_scan"
        });
        break;
    }
  };

  const handleBarcodeError = () => {
    IOToast.error(I18n.t("barcodeScan.error"));
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

  const manualInputModal = useIOBottomSheetAutoresizableModal({
    component: manualInputModalComponent,
    title: ""
  });

  const enabledFormats = IO_BARCODE_ALL_FORMATS.filter(
    format => !dataMatrixPosteEnabled && format === "DATA_MATRIX"
  );

  const enabledTypes = IO_BARCODE_ALL_TYPES.filter(
    type => !isIdPayEnabled && type === "IDPAY"
  );

  return (
    <>
      <BarcodeScanBaseScreenComponent
        barcodeFormats={enabledFormats}
        barcodeTypes={enabledTypes}
        onBarcodeSuccess={handleBarcodeSuccess}
        onBarcodeError={handleBarcodeError}
        onManualInputPressed={manualInputModal.present}
        contextualHelp={emptyContextualHelp}
      />
      {manualInputModal.bottomSheet}
    </>
  );
};

export { BarcodeScanScreen };
