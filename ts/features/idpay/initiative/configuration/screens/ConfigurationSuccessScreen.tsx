import * as pot from "@pagopa/ts-commons/lib/pot";
import { useActor } from "@xstate/react";
import { Text, View } from "native-base";
import React from "react";
import { SafeAreaView, StyleSheet } from "react-native";
import ButtonDefaultOpacity from "../../../../../components/ButtonDefaultOpacity";
import { Pictogram } from "../../../../../components/core/pictograms";
import { H3 } from "../../../../../components/core/typography/H3";
import { IOStyles } from "../../../../../components/core/variables/IOStyles";
import I18n from "../../../../../i18n";
import themeVariables from "../../../../../theme/variables";
import { useConfigurationMachineService } from "../xstate/provider";

const ConfigurationSuccessScreen = () => {
  const configurationMachine = useConfigurationMachineService();
  const [state, send] = useActor(configurationMachine);

  const initiativeDetails = pot.toUndefined(state.context.initiative);

  if (initiativeDetails === undefined) {
    return null;
  }

  const { initiativeName } = initiativeDetails;

  const handleNavigateToInitiativePress = () => {
    send({ type: "COMPLETE_CONFIGURATION" });
  };

  return (
    <SafeAreaView style={IOStyles.flex}>
      <View style={[IOStyles.horizontalContentPadding, styles.container]}>
        <View style={styles.content}>
          <Pictogram name="completed" size={80} />
          <View spacer={true} />
          <H3>{I18n.t("idpay.configuration.associationSuccess.title")}</H3>
          <View spacer={true} />
          <Text style={styles.body}>
            {I18n.t("idpay.configuration.associationSuccess.body", {
              initiativeName
            })}
          </Text>
        </View>
        <ButtonDefaultOpacity
          block={true}
          onPress={handleNavigateToInitiativePress}
        >
          <Text white={true}>
            {I18n.t("idpay.configuration.associationSuccess.button")}
          </Text>
        </ButtonDefaultOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: themeVariables.contentPadding
  },
  body: {
    textAlign: "center"
  },
  content: {
    flex: 1,
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center"
  }
});

export default ConfigurationSuccessScreen;
