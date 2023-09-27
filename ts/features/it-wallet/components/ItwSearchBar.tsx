import {
  IOColors,
  Icon,
  makeFontFamilyName,
  useIOExperimentalDesign
} from "@pagopa/io-app-design-system";
import React, { useState } from "react";
import { StyleSheet, View, TextInput } from "react-native";
import I18n from "../../../i18n";

const PADDING = 10;

/**
 * Dummy search bar component. It currently doesn't have any function beside displaying a search icon and a text input.
 */
const ItwSearchBar = () => {
  const { isExperimental } = useIOExperimentalDesign();
  const [value, setValue] = useState("");
  return (
    <View style={styles.container}>
      <Icon name="search" />
      <TextInput
        onChangeText={newValue => setValue(newValue)}
        value={value}
        placeholder={I18n.t("features.itWallet.generic.search")}
        accessibilityLabel={I18n.t("features.itWallet.generic.search")}
        placeholderTextColor={IOColors.bluegrey}
        keyboardType="default"
        style={{
          padding: PADDING,
          fontFamily: isExperimental
            ? makeFontFamilyName("ReadexPro")
            : makeFontFamilyName("TitilliumWeb"),
          width: "100%"
        }}
      />
    </View>
  );
};
export default ItwSearchBar;

const styles = StyleSheet.create({
  container: {
    paddingLeft: PADDING,
    paddingRight: PADDING,
    borderRadius: PADDING,
    justifyContent: "flex-start",
    alignItems: "center",
    flexDirection: "row",
    backgroundColor: IOColors.greyUltraLight
  }
});
