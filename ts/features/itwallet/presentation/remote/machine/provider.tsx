import { createActorContext } from "@xstate/react";
import { useIONavigation } from "../../../../../navigation/params/AppParamsList.ts";
import { useIOStore } from "../../../../../store/hooks.ts";
import { itwRemoteMachine } from "./machine.ts";
import { createRemoteActorsImplementation } from "./actors.ts";
import { createRemoteActionsImplementation } from "./actions.ts";
import { createRemoteGuardsImplementation } from "./guards.ts";

type Props = {
  children: JSX.Element;
};

export const ItwRemoteMachineContext = createActorContext(itwRemoteMachine);

export const ItwRemoteMachineProvider = (props: Props) => {
  const navigation = useIONavigation();
  const store = useIOStore();

  const remoteMachine = itwRemoteMachine.provide({
    guards: createRemoteGuardsImplementation(store),
    actions: createRemoteActionsImplementation(navigation),
    actors: createRemoteActorsImplementation()
  });

  return (
    <ItwRemoteMachineContext.Provider logic={remoteMachine}>
      {props.children}
    </ItwRemoteMachineContext.Provider>
  );
};
