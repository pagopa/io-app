import { RouteProp, useRoute } from "@react-navigation/native";
import React from "react";
import BaseScreenComponent from "../../../../components/screens/BaseScreenComponent";
import { emptyContextualHelp } from "../../../../utils/emptyContextualHelp";
import { IDPayUnsubscriptionParamsList } from "../navigation/navigator";
import { useUnsubscriptionMachineService } from "../xstate/provider";

export type IDPayUnsubscriptionConfirmationScreenParams = {
  initiativeId: string;
  initiativeName?: string;
};

type IDPayUnsubscriptionConfirmationScreenRouteProps = RouteProp<
  IDPayUnsubscriptionParamsList,
  "IDPAY_UNSUBSCRIPTION_CONFIRMATION"
>;

const UnsubscriptionConfirmationScreen = () => {
  const route = useRoute<IDPayUnsubscriptionConfirmationScreenRouteProps>();

  const { initiativeId, initiativeName } = route.params;

  const machine = useUnsubscriptionMachineService();

  React.useEffect(() => {
    machine.send({ type: "SELECT_INITIATIVE", initiativeId, initiativeName });
  }, [machine, initiativeId, initiativeName]);

  return (
    <BaseScreenComponent
      goBack={true}
      headerTitle="Rimuovi iniziativa"
      contextualHelp={emptyContextualHelp}
    ></BaseScreenComponent>
  );
};

export default UnsubscriptionConfirmationScreen;
