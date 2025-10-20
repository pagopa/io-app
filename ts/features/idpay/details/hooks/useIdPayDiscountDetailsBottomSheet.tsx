import { Divider, ListItemNav, VSpacer } from "@pagopa/io-app-design-system";
import * as pot from "@pagopa/ts-commons/lib/pot";
import { useNavigation } from "@react-navigation/native";
import I18n from "i18next";
import {
  AppParamsList,
  IOStackNavigationProp
} from "../../../../navigation/params/AppParamsList";
import { useIODispatch, useIOSelector } from "../../../../store/hooks";
import { useIOBottomSheetModal } from "../../../../utils/hooks/bottomSheet";
import { IdPayBarcodeRoutes } from "../../barcode/navigation/routes";
import { idPayBarcodeSecondsTillExpireSelector } from "../../barcode/store";
import { idPayGenerateBarcode } from "../../barcode/store/actions";
import { IdPayPaymentRoutes } from "../../payment/navigation/routes";
import {
  trackIDPayDetailBottomSheetLanding,
  trackIDPayDetailCodeGeneration,
  trackIDPayDetailQRCodeScan
} from "../analytics";
import { idpayInitiativeDetailsSelector } from "../store";
import { useOnFirstRender } from "../../../../utils/hooks/useOnFirstRender";

export const useIdPayDiscountDetailsBottomSheet = (initiativeId: string) => {
  const navigation = useNavigation<IOStackNavigationProp<AppParamsList>>();
  const barcodeSecondsSelector = useIOSelector(
    idPayBarcodeSecondsTillExpireSelector
  );
  const dispatch = useIODispatch();

  const navigateToPaymentAuthorization = () => {
    navigation.navigate(IdPayPaymentRoutes.IDPAY_PAYMENT_CODE_SCAN);
  };

  const barcodePressHandler = () => {
    const isBarcodeAvailable = barcodeSecondsSelector(initiativeId) > 0;
    if (!isBarcodeAvailable) {
      dispatch(idPayGenerateBarcode.request({ initiativeId }));
    }
    bottomSheet.dismiss();
    navigation.navigate(IdPayBarcodeRoutes.IDPAY_BARCODE_MAIN, {
      screen: IdPayBarcodeRoutes.IDPAY_BARCODE_RESULT,
      params: { initiativeId }
    });
  };

  const initiativeDataPot = useIOSelector(idpayInitiativeDetailsSelector);
  const initiativeName = pot.getOrElse(
    pot.map(initiativeDataPot, initiative => initiative.initiativeName),
    undefined
  );

  useOnFirstRender(() => {
    trackIDPayDetailBottomSheetLanding({
      initiativeId,
      initiativeName
    });
  });

  const DiscountInitiativeBottomSheetContent = () => (
    <>
      <ListItemNav
        value={I18n.t(
          "idpay.initiative.discountDetails.bottomSheetOptions.scanQr"
        )}
        icon="qrCode"
        onPress={() => {
          bottomSheet.dismiss();
          navigateToPaymentAuthorization();
          trackIDPayDetailQRCodeScan({
            initiativeId,
            initiativeName
          });
        }}
        accessibilityLabel={I18n.t(
          "idpay.initiative.discountDetails.bottomSheetOptions.scanQr"
        )}
      />
      <Divider />
      <ListItemNav
        icon="barcode"
        value={I18n.t(
          "idpay.initiative.discountDetails.bottomSheetOptions.generateBarcode"
        )}
        onPress={() => {
          barcodePressHandler();
          trackIDPayDetailCodeGeneration({
            initiativeId,
            initiativeName
          });
        }}
        accessibilityLabel={I18n.t(
          "idpay.initiative.discountDetails.bottomSheetOptions.generateBarcode"
        )}
      />
      <VSpacer size={24} />
    </>
  );

  const bottomSheet = useIOBottomSheetModal({
    component: <DiscountInitiativeBottomSheetContent />,
    title: null
  });

  return bottomSheet;
};
