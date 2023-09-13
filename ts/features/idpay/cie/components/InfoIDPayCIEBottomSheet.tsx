import React from "react";
import { View } from "react-native";
import { VSpacer } from "@pagopa/io-app-design-system";
import {
  IOBottomSheetModal,
  useIOBottomSheetAutoresizableModal
} from "../../../../utils/hooks/bottomSheet";
import { FeatureInfo } from "../../../../components/FeatureInfo";
import { NewH4 } from "../../../../components/core/typography/NewH4";
import I18n from "../../../../i18n";

/**
 * This custom hook, useInfoIDPayCIEBottomSheet, is designed to display a bottom sheet
 * containing detailed information about how the CIE (Carta d'Identità Elettronica) payment authorization works.
 */
const useInfoIDPayCIEBottomSheet = (): IOBottomSheetModal => {
  const getModalContent = () => (
    <View>
      <FeatureInfo
        iconName="pinOn"
        body={I18n.t("idpay.initiative.cie.bottomSheet.featureOne")}
      />
      <VSpacer size={24} />
      <FeatureInfo
        iconName="pinOn"
        body={I18n.t("idpay.initiative.cie.bottomSheet.featureTwo")}
      />
      <VSpacer size={24} />
      <FeatureInfo
        iconName="pinOn"
        body={I18n.t("idpay.initiative.cie.bottomSheet.featureThree")}
      />
      <VSpacer size={24} />
    </View>
  );

  const modal = useIOBottomSheetAutoresizableModal({
    component: getModalContent(),
    title: <NewH4>{I18n.t("idpay.initiative.cie.bottomSheet.title")}</NewH4>
  });

  return { ...modal };
};

export { useInfoIDPayCIEBottomSheet };
