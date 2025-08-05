import { createActorContext } from "@xstate/react";
import { PropsWithChildren } from "react";
import { useIONavigation } from "../../../../../navigation/params/AppParamsList.ts";
import { useIOStore } from "../../../../../store/hooks.ts";
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

  const proximityMachine = itwProximityMachine.provide({
    actions: createProximityActionsImplementation(navigation),
    actors: createProximityActorsImplementation(store),
    guards: createProximityGuardsImplementation()
  });

  return (
    <ItwProximityMachineContext.Provider logic={proximityMachine}>
      {children}
    </ItwProximityMachineContext.Provider>
  );
};
