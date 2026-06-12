import { View } from "react-native";
import { FeatureInfo, H4, VSpacer } from "@pagopa/io-app-design-system";
import I18n from "i18next";
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
        iconName="contactless"
        body={I18n.t("idpay.initiative.cie.bottomSheet.featureOne")}
      />
      <VSpacer size={24} />
      <FeatureInfo
        iconName="keyboard"
        body={I18n.t("idpay.initiative.cie.bottomSheet.featureTwo")}
      />
      <VSpacer size={24} />
      <FeatureInfo
        iconName="change"
        body={I18n.t("idpay.initiative.cie.bottomSheet.featureThree")}
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
