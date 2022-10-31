import React from "react";
import {
  createIDPayOnboardingMachine,
  IDPayOnboardingMachineType
} from "./machine";

type Context = IDPayOnboardingMachineType;

const Context = React.createContext<Context>({} as Context);

export const IDPayOnboardingMachineProvider = () => {
  const machine = createIDPayOnboardingMachine();
};
