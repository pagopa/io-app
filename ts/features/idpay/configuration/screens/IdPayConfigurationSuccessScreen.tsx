import * as O from "fp-ts/lib/Option";
import { pipe } from "fp-ts/lib/function";
import I18n from "i18next";
import { OperationResultScreenContent } from "../../../../components/screens/OperationResultScreenContent";
import { useHeaderSecondLevel } from "../../../../hooks/useHeaderSecondLevel";
import { useIONavigation } from "../../../../navigation/params/AppParamsList";
import { PaymentsOnboardingRoutes } from "../../../payments/onboarding/navigation/routes";
import { IdPayConfigurationMachineContext } from "../machine/provider";
import {
  selectAreInstrumentsSkipped,
  selectInitiativeDetails
} from "../machine/selectors";

export const IdPayConfigurationSuccessScreen = () => {
  const navigation = useIONavigation();
  const { useActorRef, useSelector } = IdPayConfigurationMachineContext;
  const machine = useActorRef();

  const initiativeDetails = useSelector(selectInitiativeDetails);
  const areInstrumentsSkipped = useSelector(selectAreInstrumentsSkipped);

  useHeaderSecondLevel({
    title: "",
    goBack: () => navigation.goBack(),
    contextualHelp: undefined,
    supportRequest: true
  });

  if (initiativeDetails === undefined) {
    return null;
  }

  const handleNavigateToInitiativePress = () => machine.send({ type: "next" });

  const handleAddPaymentMethodButtonPress = () =>
    navigation.replace(PaymentsOnboardingRoutes.PAYMENT_ONBOARDING_NAVIGATOR, {
      screen: PaymentsOnboardingRoutes.PAYMENT_ONBOARDING_SELECT_METHOD
    });

  const renderActionsProps = () => {
    if (areInstrumentsSkipped) {
      return {
        action: {
          label: I18n.t(
            "idpay.configuration.associationSuccess.buttons.addPaymentMethod"
          ),
          accessibilityLabel: I18n.t(
            "idpay.configuration.associationSuccess.buttons.addPaymentMethod"
          ),
          onPress: handleAddPaymentMethodButtonPress
        },
        secondaryAction: {
          label: I18n.t("idpay.configuration.associationSuccess.buttons.skip"),
          accessibilityLabel: I18n.t(
            "idpay.configuration.associationSuccess.buttons.skip"
          ),
          onPress: handleNavigateToInitiativePress
        }
      };
    }

    return {
      action: {
        label: I18n.t(
          "idpay.configuration.associationSuccess.buttons.continue"
        ),
        accessibilityLabel: I18n.t(
          "idpay.configuration.associationSuccess.buttons.continue"
        ),
        onPress: handleNavigateToInitiativePress
      }
    };
  };

  const initiativeName = pipe(
    initiativeDetails,
    O.map(i => i.initiativeName),
    O.toUndefined
  );

  return (
    <OperationResultScreenContent
      pictogram="success"
      title={I18n.t("idpay.configuration.associationSuccess.title")}
      isHeaderVisible
      subtitle={[
        {
          text: I18n.t(
            areInstrumentsSkipped
              ? "idpay.configuration.associationSuccess.noInstrumentsBody"
              : "idpay.configuration.associationSuccess.body",
            {
              initiativeName
            }
          )
        }
      ]}
      {...renderActionsProps()}
    />
  );
};
