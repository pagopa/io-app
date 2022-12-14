import { useActor } from "@xstate/react";
import React from "react";
import BaseScreenComponent from "../../../../../components/screens/BaseScreenComponent";
import { useConfigurationMachineService } from "../xstate/provider";

import I18n from "../../../../../i18n";

const IbanAssociationScreen = () => {
  const configurationMachine = useConfigurationMachineService();
  const [_state, send] = useActor(configurationMachine);

  const handleBackPress = () => {
    send({ type: "GO_BACK" });
  };

  return (
    <BaseScreenComponent
      goBack={handleBackPress}
      headerTitle={I18n.t("idpay.configuration.headerTitle")}
    ></BaseScreenComponent>
  );
};

export default IbanAssociationScreen;
