import {
  IOAppMargin,
  IOColors,
  makeFontStyleObject,
  useIOTheme
} from "@pagopa/io-app-design-system";
import React from "react";
import { Dimensions, StyleSheet, Text, View } from "react-native";
import Barcode from "@adrianso/react-native-barcode-builder";
import I18n from "../../../../i18n";
import { useIOSelector } from "../../../../store/hooks";
import { selectFiscalCodeFromEid } from "../../credentials/store/selectors";

/**
 * This magic number is the lenght of the encoded fiscal code in a CODE39 barcode.
 * It should be always the same as long as the fiscal code is always 16 characters long.
 * This is used to calculate the width of the barcode since the barcode library doesn't support
 * a max width parameter.
 */
const ENCODED_FISCAL_CODE_LENGTH_CODE39 = 288;

const ItwPresentationFiscalCode = () => {
  const fiscalCode = useIOSelector(selectFiscalCodeFromEid);
  const theme = useIOTheme();
  const barCodeWidth =
    (Dimensions.get("window").width - IOAppMargin[4]) / // Subtracting the horizontal padding which is 24 but has to be multiplied by 2 for each side
    ENCODED_FISCAL_CODE_LENGTH_CODE39;

  return (
    <View style={styles.container}>
      <Text
        style={[styles.label, { color: IOColors[theme["textBody-tertiary"]] }]}
      >
        {I18n.t("features.itWallet.presentation.credentialDetails.fiscalCode")}
      </Text>
      <Text
        style={[styles.value, { color: IOColors[theme["textBody-default"]] }]}
      >
        {fiscalCode}
      </Text>
      <Barcode
        value={fiscalCode}
        width={barCodeWidth}
        height={50}
        format={"CODE39"} // CODE39 it's the encoding format used by the physical TS-CNS card
        style={{
          alignItems: "center",
          padding: 10,
          backgroundColor: IOColors[theme["appBackground-primary"]]
        }}
        lineColor={IOColors[theme["textBody-default"]]}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 12
  },
  label: {
    ...makeFontStyleObject(14, "TitilliumSansPro", 21, "Regular")
  },
  value: {
    ...makeFontStyleObject(16, "DMMono", 24, "Regular")
  }
});

const MemoizedItwPresentationFiscalCode = React.memo(ItwPresentationFiscalCode);

export { MemoizedItwPresentationFiscalCode as ItwPresentationFiscalCode };
