import React from "react";
import { View } from "react-native";
import { VSpacer } from "@pagopa/io-app-design-system";
import {
  IOBottomSheetModal,
  useIOBottomSheetAutoresizableModal
} from "../../../../utils/hooks/bottomSheet";
import { FeatureInfo } from "../../../../components/FeatureInfo";
import { NewH4 } from "../../../../components/core/typography/NewH4";

/**
 * This custom hook, useInfoCIEBottomSheet, is designed to display a bottom sheet
 * containing detailed information about how the CIE (Carta d'Identità Elettronica) payment authorization works.
 */
const useInfoCIEBottomSheet = (): IOBottomSheetModal => {
  const getModalContent = () => (
    <View>
      <FeatureInfo
        iconName="pinOn"
        body="Puoi pagare presso tutti gli esercenti convenzionati: ti basterà appoggiare la carta d'identità elettronica sul POS."
      />
      <VSpacer size={24} />
      <FeatureInfo
        iconName="pinOn"
        body="Per autorizzare il pagamento, inserisci sul POS il tuo codice di sicurezza. Lo crei in app una volta sola e vale per qualsiasi iniziativa welfare compatibile."
      />
      <VSpacer size={24} />
      <FeatureInfo
        iconName="pinOn"
        body="Se dimentichi il codice, puoi generarne un altro in ogni momento in Profilo > Sicurezza."
      />
      <VSpacer size={24} />
    </View>
  );

  const modal = useIOBottomSheetAutoresizableModal({
    component: getModalContent(),
    title: <NewH4>Come funziona?</NewH4>
  });

  return { ...modal };
};

export { useInfoCIEBottomSheet };
