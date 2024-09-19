import {
  IOColors,
  makeFontStyleObject,
  useIOTheme
} from "@pagopa/io-app-design-system";
import React from "react";
import { StyleSheet, Text, View } from "react-native";
import Barcode from "react-native-barcode-builder";
import I18n from "../../../../i18n";
import { useIOSelector } from "../../../../store/hooks";
import { selectFiscalCodeFromEid } from "../../credentials/store/selectors";

const ItwPresentationFiscalCode = () => {
  const fiscalCode = useIOSelector(selectFiscalCodeFromEid);
  const theme = useIOTheme();

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
        width={1.54}
        height={50}
        background={IOColors[theme["appBackground-primary"]]}
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
    ...makeFontStyleObject("Regular", false, "TitilliumSansPro"),
    fontSize: 14,
    lineHeight: 21
  },
  value: {
    ...makeFontStyleObject("Medium", false, "DMMono"),
    fontSize: 16,
    lineHeight: 24
  }
});

const MemoizedItwPresentationFiscalCode = React.memo(ItwPresentationFiscalCode);

export { MemoizedItwPresentationFiscalCode as ItwPresentationFiscalCode };
