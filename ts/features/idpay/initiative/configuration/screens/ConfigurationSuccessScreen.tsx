import { useSelector } from "@xstate/react";
import { Text as NBText } from "native-base";
import React from "react";
import { SafeAreaView, StyleSheet, View } from "react-native";
import ButtonDefaultOpacity from "../../../../../components/ButtonDefaultOpacity";
import { Pictogram } from "../../../../../components/core/pictograms";
import { VSpacer } from "../../../../../components/core/spacer/Spacer";
import { H3 } from "../../../../../components/core/typography/H3";
import { IOStyles } from "../../../../../components/core/variables/IOStyles";
import I18n from "../../../../../i18n";
import themeVariables from "../../../../../theme/variables";
import { useConfigurationMachineService } from "../xstate/provider";
import {
  selectInitiativeDetails,
  selectAreInstrumentsSkipped
} from "../xstate/selectors";

const ConfigurationSuccessScreen = () => {
  const configurationMachine = useConfigurationMachineService();

  const initiativeDetails = useSelector(
    configurationMachine,
    selectInitiativeDetails
  );

  const areInstrumentsSkipped = useSelector(
    configurationMachine,
    selectAreInstrumentsSkipped
  );

  if (initiativeDetails === undefined) {
    return null;
  }

  const { initiativeName } = initiativeDetails;

  const handleNavigateToInitiativePress = () =>
    configurationMachine.send({ type: "COMPLETE_CONFIGURATION" });

  const handleAddPaymentMethodButtonPress = () =>
    configurationMachine.send({ type: "ADD_PAYMENT_METHOD" });

  const renderButtons = () => {
    if (areInstrumentsSkipped) {
      return (
        <View>
          <ButtonDefaultOpacity
            block={true}
            onPress={handleAddPaymentMethodButtonPress}
          >
            <NBText white={true}>
              {I18n.t(
                "idpay.configuration.associationSuccess.buttons.addPaymentMethod"
              )}
            </NBText>
          </ButtonDefaultOpacity>
          <VSpacer />
          <ButtonDefaultOpacity
            block={true}
            onPress={handleNavigateToInitiativePress}
            bordered={true}
          >
            <NBText>
              {I18n.t("idpay.configuration.associationSuccess.buttons.skip")}
            </NBText>
          </ButtonDefaultOpacity>
        </View>
      );
    }

    return (
      <ButtonDefaultOpacity
        block={true}
        onPress={handleNavigateToInitiativePress}
      >
        <NBText white={true}>
          {I18n.t("idpay.configuration.associationSuccess.buttons.continue")}
        </NBText>
      </ButtonDefaultOpacity>
    );
  };

  return (
    <SafeAreaView style={IOStyles.flex}>
      <View style={[IOStyles.horizontalContentPadding, styles.container]}>
        <View style={styles.content}>
          <Pictogram name="completed" size={80} />
          <VSpacer />
          <H3>{I18n.t("idpay.configuration.associationSuccess.title")}</H3>
          <VSpacer />
          <NBText style={styles.body}>
            {I18n.t(
              areInstrumentsSkipped
                ? "idpay.configuration.associationSuccess.noInstrumentsBody"
                : "idpay.configuration.associationSuccess.body",
              {
                initiativeName
              }
            )}
          </NBText>
        </View>
        {renderButtons()}
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
