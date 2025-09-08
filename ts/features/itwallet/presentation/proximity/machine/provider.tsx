import { createActorContext } from "@xstate/react";
import { PropsWithChildren } from "react";
import { pipe } from "fp-ts/lib/function";
import { useIONavigation } from "../../../../../navigation/params/AppParamsList.ts";
import { useIOSelector, useIOStore } from "../../../../../store/hooks.ts";
import { selectItwEnv } from "../../../common/store/selectors/environment.ts";
import { getEnv } from "../../../common/utils/environment.ts";
import { itwProximityMachine } from "./machine.ts";
import { createProximityActorsImplementation } from "./actors.ts";
import { createProximityActionsImplementation } from "./actions.ts";
import { createProximityGuardsImplementation } from "./guards.ts";

export const ItwProximityMachineContext =
  createActorContext(itwProximityMachine);

export const ItwProximityMachineProvider = ({
  children
}: PropsWithChildren) => {
  const navigation = useIONavigation();
  const store = useIOStore();

  const env = pipe(useIOSelector(selectItwEnv), getEnv);

  const proximityMachine = itwProximityMachine.provide({
    actions: createProximityActionsImplementation(navigation),
    actors: createProximityActorsImplementation(env, store),
    guards: createProximityGuardsImplementation()
  });

  return (
    <ItwProximityMachineContext.Provider logic={proximityMachine}>
      {children}
    </ItwProximityMachineContext.Provider>
  );
};
