import { createActorContext } from "@xstate/react";
import { PropsWithChildren } from "react";
import { useDebugInfo } from "../../../../../hooks/useDebugInfo.ts";
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

  const env = getEnv(useIOSelector(selectItwEnv));

  const proximityMachine = itwProximityMachine.provide({
    actions: createProximityActionsImplementation(navigation, store),
    actors: createProximityActorsImplementation(env),
    guards: createProximityGuardsImplementation(store)
  });

  return (
    <ItwProximityMachineContext.Provider logic={proximityMachine}>
      <DebugData />
      {children}
    </ItwProximityMachineContext.Provider>
  );
};

/**
 * Convenience component to display debug info about the machine state in the
 * ladybug component.
 */
const DebugData = () => {
  const state = ItwProximityMachineContext.useSelector(({ value }) => value);
  const context = ItwProximityMachineContext.useSelector(({ context: c }) => c);

  useDebugInfo({
    state,
    ...context
  });

  return null;
};
