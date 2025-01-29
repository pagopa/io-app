import { createActorContext } from "@xstate/react";
import { itwRemotePresentationMachine } from "./machine";
import { createRemotePresentationGuardsImplementation } from "./guards";
import { createRemotePresentationActionsImplementation } from "./actions";
import { createRemotePresentationActorsImplementation } from "./actors";

type Props = {
  children: JSX.Element;
};

export const ItwRemotePresentationMachine = createActorContext(
  itwRemotePresentationMachine
);

export const ItwRemotePresentationMachineProvider = (props: Props) => {
  const remotePresentationMachine = itwRemotePresentationMachine.provide({
    guards: createRemotePresentationGuardsImplementation(),
    actions: createRemotePresentationActionsImplementation(),
    actors: createRemotePresentationActorsImplementation()
  });

  return (
    <ItwRemotePresentationMachine.Provider logic={remotePresentationMachine}>
      {props.children}
    </ItwRemotePresentationMachine.Provider>
  );
};
