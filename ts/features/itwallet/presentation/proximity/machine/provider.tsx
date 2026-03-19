import { createActorContext } from "@xstate/react";
import { pipe } from "fp-ts/lib/function";
import { PropsWithChildren } from "react";
import { useIONavigation } from "../../../../../navigation/params/AppParamsList.ts";
import { useIOSelector, useIOStore } from "../../../../../store/hooks.ts";
import { selectItwEnv } from "../../../common/store/selectors/environment.ts";
import { getEnv } from "../../../common/utils/environment.ts";
import { createProximityActionsImplementation } from "./actions.ts";
import { createProximityActorsImplementation } from "./actors.ts";
import { createProximityGuardsImplementation } from "./guards.ts";
import { itwProximityMachine } from "./machine.ts";

export const ItwProximityMachineContext =
  createActorContext(itwProximityMachine);

export const ItwProximityMachineProvider = ({
  children
}: PropsWithChildren) => {
  const navigation = useIONavigation();
  const store = useIOStore();

  const env = pipe(useIOSelector(selectItwEnv), getEnv);

  const proximityMachine = itwProximityMachine.provide({
    actions: createProximityActionsImplementation(navigation, store),
    actors: createProximityActorsImplementation(env),
    guards: createProximityGuardsImplementation()
  });

  return (
    <ItwProximityMachineContext.Provider logic={proximityMachine}>
      {children}
    </ItwProximityMachineContext.Provider>
  );
};
