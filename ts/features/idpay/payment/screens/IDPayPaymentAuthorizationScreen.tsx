import { useSelector } from "@xstate/react";
import React from "react";
import LoadingSpinnerOverlay from "../../../../components/LoadingSpinnerOverlay";
import BaseScreenComponent from "../../../../components/screens/BaseScreenComponent";
import { usePaymentMachineService } from "../xstate/provider";
import { isLoadingSelector } from "../xstate/selectors";

const IDPayPaymentAuthorizationScreen = () => {
  const machine = usePaymentMachineService();
  const isLoading = useSelector(machine, isLoadingSelector);

  return (
    <BaseScreenComponent goBack={true} headerTitle="Autorizza operazione">
      <LoadingSpinnerOverlay isLoading={isLoading}></LoadingSpinnerOverlay>
    </BaseScreenComponent>
  );
};

export { IDPayPaymentAuthorizationScreen };
