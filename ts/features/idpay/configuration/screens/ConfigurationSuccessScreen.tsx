import React from "react";
import { SafeAreaView, StyleSheet, View } from "react-native";
import { useSelector } from "@xstate/react";
import {
  Body,
  ButtonOutline,
  ButtonSolid,
  H3,
  IOStyles,
  Pictogram,
  VSpacer
} from "@pagopa/io-app-design-system";
import I18n from "../../../../i18n";
import themeVariables from "../../../../theme/variables";
import { useConfigurationMachineService } from "../xstate/provider";
import {
  selectAreInstrumentsSkipped,
  selectInitiativeDetails
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
          <ButtonSolid
            label={I18n.t(
              "idpay.configuration.associationSuccess.buttons.addPaymentMethod"
            )}
            accessibilityLabel={I18n.t(
              "idpay.configuration.associationSuccess.buttons.addPaymentMethod"
            )}
            onPress={handleAddPaymentMethodButtonPress}
            fullWidth={true}
          />
          <VSpacer />
          <ButtonOutline
            label={I18n.t(
              "idpay.configuration.associationSuccess.buttons.skip"
            )}
            accessibilityLabel={I18n.t(
              "idpay.configuration.associationSuccess.buttons.skip"
            )}
            onPress={handleNavigateToInitiativePress}
            fullWidth={true}
          />
        </View>
      );
    }

    return (
      <ButtonSolid
        label={I18n.t(
          "idpay.configuration.associationSuccess.buttons.continue"
        )}
        accessibilityLabel={I18n.t(
          "idpay.configuration.associationSuccess.buttons.continue"
        )}
        onPress={handleNavigateToInitiativePress}
        fullWidth={true}
      />
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
          <View style={IOStyles.alignCenter}>
            <Body style={{ textAlign: "center" }}>
              {I18n.t(
                areInstrumentsSkipped
                  ? "idpay.configuration.associationSuccess.noInstrumentsBody"
                  : "idpay.configuration.associationSuccess.body",
                {
                  initiativeName
                }
              )}
            </Body>
          </View>
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
  content: {
    flex: 1,
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center"
  }
});

export default ConfigurationSuccessScreen;
