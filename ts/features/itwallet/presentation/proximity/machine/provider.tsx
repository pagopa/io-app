import { createActorContext } from "@xstate/react";
import { PropsWithChildren } from "react";
import { useIONavigation } from "../../../../../navigation/params/AppParamsList.ts";
import { itwProximityMachine } from "./machine.ts";
import { createProximityActorsImplementation } from "./actors.ts";
import { createProximityActionsImplementation } from "./actions.ts";

export const ItwProximityMachineContext =
  createActorContext(itwProximityMachine);

export const ItwProximityMachineProvider = ({
  children
}: PropsWithChildren) => {
  const navigation = useIONavigation();

  const proximityMachine = itwProximityMachine.provide({
    actions: createProximityActionsImplementation(navigation),
    actors: createProximityActorsImplementation()
  });

  return (
    <ItwProximityMachineContext.Provider logic={proximityMachine}>
      {children}
    </ItwProximityMachineContext.Provider>
  );
};
