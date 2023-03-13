import { Text as NBText } from "native-base";
import React from "react";
import { SafeAreaView, StyleSheet, View } from "react-native";
import { Pictogram } from "../../../../components/core/pictograms";
import { VSpacer } from "../../../../components/core/spacer/Spacer";
import { H3 } from "../../../../components/core/typography/H3";
import { IOStyles } from "../../../../components/core/variables/IOStyles";
import ButtonOutline from "../../../../components/ui/ButtonOutline";
import I18n from "../../../../i18n";
import themeVariables from "../../../../theme/variables";
import { useUnsubscriptionMachineService } from "../xstate/provider";

const UnsubscriptionFailureScreen = () => {
  const machine = useUnsubscriptionMachineService();

  const handleClosePress = () => {
    machine.send({ type: "EXIT" });
  };

  return (
    <SafeAreaView style={[IOStyles.flex, { flexGrow: 1 }]}>
      <View style={[styles.wrapper, IOStyles.horizontalContentPadding]}>
        <View style={styles.content}>
          <Pictogram name="umbrella" size={80} />
          <VSpacer size={16} />
          <H3>{I18n.t("idpay.unsubscription.failure.title")}</H3>
          <VSpacer size={16} />
          <NBText style={styles.body}>
            {I18n.t("idpay.unsubscription.failure.content")}
          </NBText>
        </View>
        <ButtonOutline
          color="primary"
          label={I18n.t("idpay.unsubscription.failure.button")}
          accessibilityLabel={I18n.t("idpay.unsubscription.failure.button")}
          onPress={handleClosePress}
          fullWidth={true}
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    flexGrow: 1
  },
  content: {
    flexGrow: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: themeVariables.contentPadding
  },
  body: {
    textAlign: "center"
  }
});

export default UnsubscriptionFailureScreen;
