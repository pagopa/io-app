import * as pot from "@pagopa/ts-commons/lib/pot";
import { useActor } from "@xstate/react";
import { Text as NBButtonText } from "native-base";
import React from "react";
import { View, SafeAreaView, StyleSheet } from "react-native";
import ButtonDefaultOpacity from "../../../../../components/ButtonDefaultOpacity";
import { Pictogram } from "../../../../../components/core/pictograms";
import { VSpacer } from "../../../../../components/core/spacer/Spacer";
import { Body } from "../../../../../components/core/typography/Body";
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
          <VSpacer size={16} />
          <H3>{I18n.t("idpay.configuration.associationSuccess.title")}</H3>
          <VSpacer size={16} />
          <View style={IOStyles.alignCenter}>
            <Body>
              {I18n.t("idpay.configuration.associationSuccess.body", {
                initiativeName
              })}
            </Body>
          </View>
        </View>
        <ButtonDefaultOpacity
          block={true}
          onPress={handleNavigateToInitiativePress}
        >
          <NBButtonText white={true}>
            {I18n.t("idpay.configuration.associationSuccess.button")}
          </NBButtonText>
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
  content: {
    flex: 1,
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center"
  }
});

export default ConfigurationSuccessScreen;
