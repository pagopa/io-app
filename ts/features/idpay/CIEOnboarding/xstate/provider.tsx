import { useNavigation } from "@react-navigation/native";
import { useInterpret } from "@xstate/react";
import * as React from "react";
import { InterpreterFrom } from "xstate";
import {
  AppParamsList,
  IOStackNavigationProp
} from "../../../../navigation/params/AppParamsList";
import { useIODispatch } from "../../../../store/hooks";
import { useXStateMachine } from "../../../../xstate/hooks/useXStateMachine";
import { createActionsImplementation } from "./actions";
import {
  IDPayCIEOnboardingMachineType,
  createIDPayCIEOnboardingMachine
} from "./machine";
import { createServicesImplementation } from "./services";

type CIEOnboardingMachineContext =
  InterpreterFrom<IDPayCIEOnboardingMachineType>;
const CIEOnboardingMachineContext =
  React.createContext<CIEOnboardingMachineContext>(
    {} as CIEOnboardingMachineContext
  );

type Props = {
  children: React.ReactNode;
};

const IDPayCIEOnboardingMachineProvider = (props: Props) => {
  const dispatch = useIODispatch();
  const isIDPayCodeEnabled = true; // TODO: get from store
  const machineGenerator = () =>
    createIDPayCIEOnboardingMachine(isIDPayCodeEnabled);
  const [machine] = useXStateMachine(machineGenerator);
  const navigation = useNavigation<IOStackNavigationProp<AppParamsList>>();
  const token = "token"; // get from wherever
  const client = null; // ''

  const actions = createActionsImplementation(navigation, dispatch);
  const services = createServicesImplementation(client, token);

  const machineService = useInterpret(machine, { services, actions });

  return (
    <CIEOnboardingMachineContext.Provider value={machineService}>
      {props.children}
    </CIEOnboardingMachineContext.Provider>
  );
};

const useCIEOnboardingMachineService = () =>
  React.useContext(CIEOnboardingMachineContext);

export {
  CIEOnboardingMachineContext,
  IDPayCIEOnboardingMachineProvider,
  useCIEOnboardingMachineService
};
