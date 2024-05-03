import { createActorContext } from "@xstate/react";
import React from "react";
import { useActionsImplementation } from "./actions";
import { useActorsImplementation } from "./actors";
import { idPayPaymentMachine } from "./machine";

type Props = {
  children: React.ReactNode;
};

export const IdPayPaymentMachineContext =
  createActorContext(idPayPaymentMachine);

export const IdPayPaymentMachineProvider = (props: Props) => {
  const actors = useActorsImplementation();
  const actions = useActionsImplementation();

  const machine = idPayPaymentMachine.provide({
    actors,
    actions
  });

  return (
    <IdPayPaymentMachineContext.Provider logic={machine}>
      {props.children}
    </IdPayPaymentMachineContext.Provider>
  );
};
