import { createActorContext } from "@xstate/react";
import { PropsWithChildren } from "react";

import { useDebugInfo } from "../../../../../hooks/useDebugInfo.ts";
import { useIONavigation } from "../../../../../navigation/params/AppParamsList.ts";
import { useIOSelector, useIOStore } from "../../../../../store/hooks.ts";
import { isDebugModeEnabledSelector } from "../../../../../store/reducers/debug.ts";
import { selectItwEnv } from "../../../common/store/selectors/environment.ts";
import { getEnv } from "../../../common/utils/environment.ts";
import { itwProximityMachine } from "./machine.ts";

export const ItwProximityMachineContext =
  createActorContext(itwProximityMachine);

export const ItwProximityMachineProvider = ({
  children
}: PropsWithChildren) => {
  const navigation = useIONavigation();
  const store = useIOStore();

  const env = getEnv(useIOSelector(selectItwEnv));

  return (
    <ItwProximityMachineContext.Provider
      logic={itwProximityMachine}
      options={{
        input: { deps: { env, navigation, store } }
      }}
    >
      <DebugData />
      {children}
    </ItwProximityMachineContext.Provider>
  );
};

/**
 * Convenience component to display debug info about the machine state in the ladybug component.
 */
const DebugData = () => {
  const isDebugModeEnabled = useIOSelector(isDebugModeEnabledSelector);

  return isDebugModeEnabled ? <MachineDebugData /> : null;
};

const MachineDebugData = () => {
  const state = ItwProximityMachineContext.useSelector(({ value }) => value);
  const context = ItwProximityMachineContext.useSelector(({ context: c }) => c);
  const { deps: _, ...debugContext } = context;

  useDebugInfo({
    state,
    ...debugContext
  });

  return null;
};
