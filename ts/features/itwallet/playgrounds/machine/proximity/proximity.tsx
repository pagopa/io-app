import { PropsWithChildren } from "react";
import { useIONavigation } from "../../../../../navigation/params/AppParamsList.ts";
import { createProximityActorsImplementation } from "../../../presentation/proximity/machine/actors.ts";
import { itwProximityMachine } from "../../../presentation/proximity/machine/machine.ts";
import { ItwProximityMachineContext } from "../../../presentation/proximity/machine/provider.tsx";
import { createProximityActionsImplementation } from "./actions.ts";

export const ItwPlaygroundProximityMachineProvider = ({
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
