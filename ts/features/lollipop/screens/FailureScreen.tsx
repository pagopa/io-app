import I18n from "i18n-js";
import { H3, Text, View } from "native-base";
import * as React from "react";
import { SafeAreaView, StyleSheet } from "react-native";
import ButtonDefaultOpacity from "../../../components/ButtonDefaultOpacity";
import Pictogram from "../../../components/core/pictograms/Pictogram";
import { VSpacer } from "../../../components/core/spacer/Spacer";
import { IOStyles } from "../../../components/core/variables/IOStyles";
import themeVariables from "../../../theme/variables";
import { openWebUrl } from "../../../utils/url";

const FailureScreen = () => {
  const handleWhyIsThat = () => {
    const learnMoreLink = "https://io.italia.it/faq/#n1_11";
    openWebUrl(learnMoreLink);
  };
  const renderWhyIsThat = () => (
      <ButtonDefaultOpacity block={true} onPress={handleWhyIsThat}>
        <Text>{I18n.t("unsupportedDevice.cta.faq")}</Text>
      </ButtonDefaultOpacity>
    );

  return (
    <SafeAreaView style={IOStyles.flex}>
      <View style={styles.errorContainer}>
        <Pictogram name={"error"} size={120} />
        <VSpacer size={16} />
        <H3 style={styles.title}>{I18n.t("unsupportedDevice.title")}</H3>
        <VSpacer size={16} />
        <Text alignCenter={true}>{I18n.t("unsupportedDevice.subtitle")}</Text>
      </View>
      <View style={styles.buttonContainer}>{renderWhyIsThat()}</View>
    </SafeAreaView>
  );
};

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

export default FailureScreen;
