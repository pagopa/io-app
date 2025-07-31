import { createActorContext } from "@xstate/react";
import { JSX } from "react";
import { pipe } from "fp-ts/function";
import { useIONavigation } from "../../../../../navigation/params/AppParamsList.ts";
import { useIOSelector, useIOStore } from "../../../../../store/hooks.ts";
import { selectItwEnv } from "../../../common/store/selectors/environment.ts";
import { getEnv } from "../../../common/utils/environment.ts";
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
  const env = pipe(useIOSelector(selectItwEnv), getEnv);

  const remoteMachine = itwRemoteMachine.provide({
    guards: createRemoteGuardsImplementation(store),
    actions: createRemoteActionsImplementation(navigation, store),
    actors: createRemoteActorsImplementation(env, store)
  });

  return (
    <ItwRemoteMachineContext.Provider logic={remoteMachine}>
      {props.children}
    </ItwRemoteMachineContext.Provider>
  );
};
