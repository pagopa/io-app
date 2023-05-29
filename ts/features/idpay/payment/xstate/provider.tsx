import { useNavigation } from "@react-navigation/native";
import { useInterpret } from "@xstate/react";
import * as O from "fp-ts/lib/Option";
import React from "react";
import { InterpreterFrom } from "xstate";
import {
  idPayApiBaseUrl,
  idPayApiUatBaseUrl,
  idPayTestToken
} from "../../../../config";
import { useXStateMachine } from "../../../../hooks/useXStateMachine";
import {
  AppParamsList,
  IOStackNavigationProp
} from "../../../../navigation/params/AppParamsList";
import { useIOSelector } from "../../../../store/hooks";
import { sessionInfoSelector } from "../../../../store/reducers/authentication";
import { isPagoPATestEnabledSelector } from "../../../../store/reducers/persistedPreferences";
import { createIDPayPaymentClient } from "../api/client";
import { IDPayPaymentMachineType, createIDPayPaymentMachine } from "./machine";
import { createServicesImplementation } from "./services";
import { createActionsImplementation } from "./actions";

type AuthorizationMachineContext = InterpreterFrom<IDPayPaymentMachineType>;

const AuthorizationMachineContext =
  React.createContext<AuthorizationMachineContext>(
    {} as AuthorizationMachineContext
  );

type Props = {
  children: React.ReactNode;
};

const IDPayPaymentMachineProvider = (props: Props) => {
  const [machine] = useXStateMachine(createIDPayPaymentMachine);

  const sessionInfo = useIOSelector(sessionInfoSelector);
  const isPagoPATestEnabled = useIOSelector(isPagoPATestEnabledSelector);

  const navigation = useNavigation<IOStackNavigationProp<AppParamsList>>();

  if (O.isNone(sessionInfo)) {
    throw new Error("Session info is undefined");
  }

  const { bpdToken } = sessionInfo.value;

  const idPayToken = idPayTestToken ?? bpdToken;

  const IDPayPaymentClient = createIDPayPaymentClient(
    isPagoPATestEnabled ? idPayApiUatBaseUrl : idPayApiBaseUrl
  );

  const actions = createActionsImplementation(navigation);

  const services = createServicesImplementation(IDPayPaymentClient, idPayToken);

  const machineService = useInterpret(machine, { services, actions });

  return (
    <AuthorizationMachineContext.Provider value={machineService}>
      {props.children}
    </AuthorizationMachineContext.Provider>
  );
};

const useAuthorizationMachineService = () =>
  React.useContext(AuthorizationMachineContext);

export {
  IDPayPaymentMachineProvider,
  useAuthorizationMachineService,
  AuthorizationMachineContext
};
