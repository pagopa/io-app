import { useSelector } from "@xstate/react";
import React from "react";
import { SafeAreaView, StyleSheet, View } from "react-native";
import {
  ButtonOutline,
  VSpacer,
  IOPictograms,
  Pictogram,
  Body,
  IOStyles
} from "@pagopa/io-app-design-system";
import { H3 } from "../../../../components/core/typography/H3";
import I18n from "../../../../i18n";
import themeVariables from "../../../../theme/variables";
import { useUnsubscriptionMachineService } from "../xstate/provider";
import { selectIsFailure } from "../xstate/selectors";

type ScreenContentType = {
  pictogram: IOPictograms;
  title: string;
  content: string;
  buttonLabel: string;
};

const UnsubscriptionResultScreen = () => {
  const machine = useUnsubscriptionMachineService();
  const isFailure = useSelector(machine, selectIsFailure);

  const { pictogram, title, content, buttonLabel }: ScreenContentType =
    isFailure
      ? {
          pictogram: "umbrella",
          title: I18n.t("idpay.unsubscription.failure.title"),
          content: I18n.t("idpay.unsubscription.failure.content"),
          buttonLabel: I18n.t("idpay.unsubscription.failure.button")
        }
      : {
          pictogram: "completed",
          title: I18n.t("idpay.unsubscription.success.title"),
          content: I18n.t("idpay.unsubscription.success.content"),
          buttonLabel: I18n.t("idpay.unsubscription.success.button")
        };

  const handleButtonPress = () => machine.send({ type: "EXIT" });

  return (
    <SafeAreaView style={[IOStyles.flex, { flexGrow: 1 }]}>
      <View style={[styles.wrapper, IOStyles.horizontalContentPadding]}>
        <View style={styles.content}>
          <Pictogram name={pictogram} size={80} />
          <VSpacer size={16} />
          <H3>{title}</H3>
          <VSpacer size={16} />
          <Body style={{ textAlign: "center" }}>{content}</Body>
        </View>
        <ButtonOutline
          color="primary"
          label={buttonLabel}
          accessibilityLabel={buttonLabel}
          onPress={handleButtonPress}
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
  }
});

export default UnsubscriptionResultScreen;
