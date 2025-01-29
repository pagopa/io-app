import { createActorContext } from "@xstate/react";
import { itwRemotePresentationMachine } from "./machine";
import { createRemotePresentationGuardsImplementation } from "./guards";
import { createRemotePresentationActionsImplementation } from "./actions";
import { createRemotePresentationActorsImplementation } from "./actors";

type Props = {
  children: JSX.Element;
};

export const ItwRemotePresentationMachineContext = createActorContext(
  itwRemotePresentationMachine
);

export const ItwRemotePresentationMachineProvider = (props: Props) => {
  const remotePresentationMachine = itwRemotePresentationMachine.provide({
    guards: createRemotePresentationGuardsImplementation(),
    actions: createRemotePresentationActionsImplementation(),
    actors: createRemotePresentationActorsImplementation()
  });

  return (
    <ItwRemotePresentationMachineContext.Provider
      logic={remotePresentationMachine}
    >
      {props.children}
    </ItwRemotePresentationMachineContext.Provider>
  );
};
