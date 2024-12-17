import {
  Body,
  ButtonOutline,
  ButtonSolid,
  H3,
  IOStyles,
  Pictogram,
  VSpacer
} from "@pagopa/io-app-design-system";
import * as O from "fp-ts/lib/Option";
import { pipe } from "fp-ts/lib/function";
import { SafeAreaView, StyleSheet, View } from "react-native";
import I18n from "../../../../i18n";
import { useIONavigation } from "../../../../navigation/params/AppParamsList";
import themeVariables from "../../../../theme/variables";
import { IdPayConfigurationMachineContext } from "../machine/provider";
import {
  selectAreInstrumentsSkipped,
  selectInitiativeDetails
} from "../machine/selectors";
import { PaymentsOnboardingRoutes } from "../../../payments/onboarding/navigation/routes";

export const ConfigurationSuccessScreen = () => {
  const navigation = useIONavigation();
  const { useActorRef, useSelector } = IdPayConfigurationMachineContext;
  const machine = useActorRef();

  const initiativeDetails = useSelector(selectInitiativeDetails);
  const areInstrumentsSkipped = useSelector(selectAreInstrumentsSkipped);

  if (initiativeDetails === undefined) {
    return null;
  }

  const handleNavigateToInitiativePress = () => machine.send({ type: "next" });

  const handleAddPaymentMethodButtonPress = () =>
    navigation.replace(PaymentsOnboardingRoutes.PAYMENT_ONBOARDING_NAVIGATOR, {
      screen: PaymentsOnboardingRoutes.PAYMENT_ONBOARDING_SELECT_METHOD
    });

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

  const initiativeName = pipe(
    initiativeDetails,
    O.map(i => i.initiativeName),
    O.toUndefined
  );

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
