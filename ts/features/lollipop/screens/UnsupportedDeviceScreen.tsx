import I18n from "i18n-js";
import { Text } from "native-base";
import * as React from "react";
import { View, SafeAreaView, StyleSheet } from "react-native";
import ButtonDefaultOpacity from "../../../components/ButtonDefaultOpacity";
import Pictogram from "../../../components/core/pictograms/Pictogram";
import { VSpacer } from "../../../components/core/spacer/Spacer";
import { H3 } from "../../../components/core/typography/H3";
import { IOStyles } from "../../../components/core/variables/IOStyles";
import { unsupportedDeviceLearnMoreUrl } from "../../../config";
import themeVariables from "../../../theme/variables";
import { openWebUrl } from "../../../utils/url";

const styles = StyleSheet.create({
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 56
  },
  buttonContainer: {
    justifyContent: "center",
    alignItems: "center",
    padding: themeVariables.contentPadding
  },
  title: {
    textAlign: "center"
  }
});

const handleLearnMorePress = () => {
  openWebUrl(unsupportedDeviceLearnMoreUrl);
};

const UnsupportedDeviceScreen = () => (
  <SafeAreaView style={IOStyles.flex}>
    <View style={styles.errorContainer}>
      <Pictogram name={"error"} size={120} />
      <VSpacer size={16} />
      <H3 style={styles.title}>{I18n.t("unsupportedDevice.title")}</H3>
      <VSpacer size={16} />
      <Text alignCenter={true}>{I18n.t("unsupportedDevice.subtitle")}</Text>
    </View>
    <View style={styles.buttonContainer}>
      <ButtonDefaultOpacity block={true} onPress={handleLearnMorePress}>
        <Text>{I18n.t("unsupportedDevice.cta.faq")}</Text>
      </ButtonDefaultOpacity>
    </View>
  </SafeAreaView>
);

export default UnsupportedDeviceScreen;
