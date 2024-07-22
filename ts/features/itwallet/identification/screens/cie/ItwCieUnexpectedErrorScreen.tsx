/**
 * A screen to alert the user about the number of attempts remains
 */
import * as React from "react";
import I18n from "../../../../../i18n";
import { useIONavigation } from "../../../../../navigation/params/AppParamsList";
import { OperationResultScreenContent } from "../../../../../components/screens/OperationResultScreenContent";
import { ITW_ROUTES } from "../../../navigation/routes";
import { ItwEidIssuanceMachineContext } from "../../../machine/provider";

export const ItwCieUnexpectedErrorScreen = () => {
  const machineRef = ItwEidIssuanceMachineContext.useActorRef();

  const navigation = useIONavigation();

  const retry = React.useCallback(() => {
    machineRef.send({ type: "back" });
  }, [machineRef]);

  const navigateToAuthenticationScreen = React.useCallback(() => {
    navigation.reset({
      index: 0,
      routes: [{ name: ITW_ROUTES.MAIN }]
    });
  }, [navigation]);

  const action = {
    label: I18n.t("global.buttons.retry"),
    onPress: retry
  };

  const secondaryAction = {
    label: I18n.t("global.buttons.close"),
    onPress: navigateToAuthenticationScreen
  };

  return (
    <OperationResultScreenContent
      pictogram="umbrellaNew"
      title={I18n.t("authentication.cie.card.error.genericErrorTitle")}
      subtitle={I18n.t("authentication.cie.card.error.genericErrorSubtitle")}
      action={action}
      secondaryAction={secondaryAction}
    />
  );
};
