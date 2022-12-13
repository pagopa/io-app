import { Text as NBText, View } from "native-base";
import * as React from "react";
import { StyleSheet } from "react-native";
import I18n from "../../i18n";
import customVariables from "../../theme/variables";
import IconFont from "../ui/IconFont";

const styles = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "center" },
  flex: { flex: 1 },
  bordered: {
    borderTopColor: customVariables.contentPrimaryBackground,
    borderTopWidth: 2,
    paddingHorizontal: customVariables.contentPadding
  },
  separator: {
    width: 1,
    height: "100%",
    marginHorizontal: 16,
    borderRightColor: customVariables.contentPrimaryBackground,
    borderRightWidth: 1
  }
});

export default function BetaBannerComponent() {
  return (
    <View footer={true} style={styles.bordered}>
      <View style={styles.row}>
        <IconFont
          name={"io-logo"}
          size={24}
          color={customVariables.contentPrimaryBackground}
        />
        <View style={styles.separator} />
        <View style={styles.flex}>
          <NBText primary={true}>{I18n.t("betaBanner.description")}</NBText>
        </View>
      </View>
      <View spacer={true} />
    </View>
  );
}
