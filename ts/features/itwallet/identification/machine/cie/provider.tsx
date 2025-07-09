import { createActorContext } from "@xstate/react";
import { PropsWithChildren } from "react";
import { useScreenReaderEnabled } from "../../../../../utils/accessibility";
import { createCieActionsImplementation } from "./actions";
import { createCieActorsImplementation } from "./actors";
import { itwCieMachine } from "./machine";

export const ItwCieMachineContext = createActorContext(itwCieMachine);

type ProviderProps = {
  pin: string;
  authenticationUrl: string;
};

export const ItwCieMachineProvider = ({
  children,
  pin,
  authenticationUrl
}: PropsWithChildren<ProviderProps>) => {
  const isScreenReaderEnabled = useScreenReaderEnabled();

  const eidIssuanceMachine = itwCieMachine.provide({
    actions: createCieActionsImplementation(),
    actors: createCieActorsImplementation()
  });

  return (
    <ItwCieMachineContext.Provider
      logic={eidIssuanceMachine}
      options={{ input: { pin, authenticationUrl, isScreenReaderEnabled } }}
    >
      {children}
    </ItwCieMachineContext.Provider>
  );
};
