import { FeatureInfo, H4, VSpacer } from "@io-app/design-system";
import I18n from "i18next";
import { View } from "react-native";

import {
  IOBottomSheetModal,
  useIOBottomSheetModal
} from "../../../../utils/hooks/bottomSheet";

/**
 * This custom hook, useIdPayInfoCieBottomSheet, is designed to display a bottom sheet
 * containing detailed information about how the CIE (Carta d'Identità Elettronica) payment authorization works.
 */
const useIdPayInfoCieBottomSheet = (): IOBottomSheetModal => {
  const getModalContent = () => (
    <View>
      <FeatureInfo
        body={I18n.t("idpay.initiative.cie.bottomSheet.featureOne")}
        iconName="contactless"
      />
      <VSpacer size={24} />
      <FeatureInfo
        body={I18n.t("idpay.initiative.cie.bottomSheet.featureTwo")}
        iconName="keyboard"
      />
      <VSpacer size={24} />
      <FeatureInfo
        body={I18n.t("idpay.initiative.cie.bottomSheet.featureThree")}
        iconName="change"
      />
      <VSpacer size={24} />
    </View>
  );

  const modal = useIOBottomSheetModal({
    component: getModalContent(),
    title: <H4>{I18n.t("idpay.initiative.cie.bottomSheet.title")}</H4>
  });

  return { ...modal };
};

export { useIdPayInfoCieBottomSheet };
