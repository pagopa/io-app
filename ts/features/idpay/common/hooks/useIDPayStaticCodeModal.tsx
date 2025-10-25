import {
  Body,
  ContentWrapper,
  H2,
  h3FontSize,
  h3LineHeight,
  IOButton,
  IOColors,
  IOText,
  VSpacer
} from "@pagopa/io-app-design-system";
import { JSX } from "react";
import { View } from "react-native";
import Barcode from "react-native-barcode-builder";
import { useIOSelector } from "../../../../store/hooks";
import { clipboardSetStringWithFeedback } from "../../../../utils/clipboard";
import { useIOBottomSheetModal } from "../../../../utils/hooks/bottomSheet";
import { idPayStaticCodeValueSelector } from "../../barcode/store/selectors";

type IDPayFailureSupportModal = {
  bottomSheet: JSX.Element;
  present: () => void;
};

const useIDPayStaticCodeModal = (): IDPayFailureSupportModal => {
  const barcode = useIOSelector(idPayStaticCodeValueSelector);

  const { bottomSheet, present } = useIOBottomSheetModal({
    component:
      barcode === "" ? (
        <></>
      ) : (
        <>
          <H2 weight="Semibold">Ecco il codice statico</H2>
          <VSpacer size={16} />
          <Body>
            Usa questo codice, se richiesto da un venditore online in fase di
            acquisto.
          </Body>
          <VSpacer size={24} />
          <View
            style={{
              borderColor: IOColors["grey-100"],
              borderWidth: 1,
              padding: 16,
              borderRadius: 8
            }}
          >
            <VSpacer size={4} />
            <Barcode format="CODE128" value={barcode} />
            <View style={{ alignItems: "center" }}>
              <IOText
                font="FiraCode"
                size={h3FontSize}
                lineHeight={h3LineHeight}
                weight="Medium"
              >
                {barcode}
              </IOText>
            </View>
            <VSpacer size={32} />
          </View>
        </>
      ),
    title: "",
    footer: (
      <ContentWrapper>
        <IOButton
          fullWidth
          variant="solid"
          label={"Copia codice statico"}
          onPress={() => clipboardSetStringWithFeedback(barcode)}
        />
        <VSpacer size={32} />
      </ContentWrapper>
    )
  });

  return {
    bottomSheet,
    present
  };
};

export default useIDPayStaticCodeModal;
