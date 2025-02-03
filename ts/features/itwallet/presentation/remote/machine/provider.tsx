import { createActorContext } from "@xstate/react";
import { itwRemoteMachine } from "./machine.ts";
import { createRemoteActorsImplementation } from "./actors.ts";
import { createRemoteActionsImplementation } from "./actions.ts";
import { createRemoteGuardsImplementation } from "./guards.ts";

type Props = {
  children: JSX.Element;
};

export const ItwRemoteMachineContext = createActorContext(itwRemoteMachine);

export const ItwRemoteMachineProvider = (props: Props) => {
  const remoteMachine = itwRemoteMachine.provide({
    guards: createRemoteGuardsImplementation(),
    actions: createRemoteActionsImplementation(),
    actors: createRemoteActorsImplementation()
  });

  return (
    <ItwRemoteMachineContext.Provider logic={remoteMachine}>
      {props.children}
    </ItwRemoteMachineContext.Provider>
  );
};
