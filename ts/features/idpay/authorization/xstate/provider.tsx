import { useInterpret } from "@xstate/react";
import React from "react";
import { InterpreterFrom } from "xstate";
import { useXStateMachine } from "../../../../hooks/useXStateMachine";
import {
  IDPayAuthorizationMachineType,
  createIDPayAuthorizationMachine
} from "./machine";

type AuthorizationMachineContext =
  InterpreterFrom<IDPayAuthorizationMachineType>;

const AuthorizationMachineContext =
  React.createContext<AuthorizationMachineContext>(
    {} as AuthorizationMachineContext
  );

type Props = {
  children: React.ReactNode;
};

const IDPayAuthorizationMachineProvider = (props: Props) => {
  const [machine] = useXStateMachine(createIDPayAuthorizationMachine);

  const machineService = useInterpret(machine);

  return (
    <AuthorizationMachineContext.Provider value={machineService}>
      {props.children}
    </AuthorizationMachineContext.Provider>
  );
};

const useAuthorizationMachineService = () =>
  React.useContext(AuthorizationMachineContext);

export {
  IDPayAuthorizationMachineProvider,
  useAuthorizationMachineService,
  AuthorizationMachineContext
};
