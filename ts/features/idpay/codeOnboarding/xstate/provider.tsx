import { useNavigation } from "@react-navigation/native";
import { useInterpret } from "@xstate/react";
import * as React from "react";
import { InterpreterFrom } from "xstate";
import {
  AppParamsList,
  IOStackNavigationProp
} from "../../../../navigation/params/AppParamsList";
import { useXStateMachine } from "../../../../xstate/hooks/useXStateMachine";
import { createActionsImplementation } from "./actions";
import {
  IDPayCodeOnboardingMachineType,
  createIDPayCodeOnboardingMachine
} from "./machine";
import { createServicesImplementation } from "./services";

type CodeOnboardingMachineContext =
  InterpreterFrom<IDPayCodeOnboardingMachineType>;
const CodeOnboardingMachineContext =
  React.createContext<CodeOnboardingMachineContext>(
    {} as CodeOnboardingMachineContext
  );

type Props = {
  children: React.ReactNode;
};

const IDPayCodeOnboardingMachineProvider = (props: Props) => {
  // const dispatch = useIODispatch();
  const isIDPayCodeEnabled = true; // TODO: get from store
  const machineGenerator = () =>
    createIDPayCodeOnboardingMachine(isIDPayCodeEnabled);
  const [machine] = useXStateMachine(machineGenerator);
  const navigation = useNavigation<IOStackNavigationProp<AppParamsList>>();
  const token = "token"; // get from wherever
  const client = null; // ''

  const actions = createActionsImplementation(
    navigation
    //  dispatch
  );
  const services = createServicesImplementation(client, token);

  const machineService = useInterpret(machine, { services, actions });

  return (
    <CodeOnboardingMachineContext.Provider value={machineService}>
      {props.children}
    </CodeOnboardingMachineContext.Provider>
  );
};

const useCodeOnboardingMachineService = () =>
  React.useContext(CodeOnboardingMachineContext);

export {
  CodeOnboardingMachineContext,
  IDPayCodeOnboardingMachineProvider,
  useCodeOnboardingMachineService
};
