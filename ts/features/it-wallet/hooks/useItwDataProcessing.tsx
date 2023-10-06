import * as React from "react";
import { View } from "react-native";
import { Body, H6, VSpacer } from "@pagopa/io-app-design-system";
import { useIOBottomSheetModal } from "../../../utils/hooks/bottomSheet";
import { IOStyles } from "../../../components/core/variables/IOStyles";

/**
 * A hook that returns a function to present the abort wallet activation flow bottom sheet
 */
export const useItwDataProcessing = () => {
  const BottomSheetBody = () => (
    <View style={IOStyles.flex}>
      <H6>{"Perché è necessario?"}</H6>
      <VSpacer size={8} />
      <Body>
        {
          "Per ottenere il rilascio della tessera L’ente autorizzato ad emettere questa tessera ha bisogno di leggere i tuoi dati per verificarne l’identità."
        }
      </Body>
      <VSpacer size={24} />
      <H6>{"Sicurezza del trattamento"}</H6>
      <VSpacer size={8} />
      <Body>
        {
          "App IO consente la condivisione dei tuoi dati solo con enti verificati e iscritti alle liste che ne garantiscono l’affidabilità."
        }
      </Body>
    </View>
  );
  const { present, bottomSheet, dismiss } = useIOBottomSheetModal({
    title: "Trattamento dei dati",
    component: <BottomSheetBody />,
    snapPoint: [350]
  });

  return {
    dismiss,
    present,
    bottomSheet
  };
};
