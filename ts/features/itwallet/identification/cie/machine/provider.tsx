import { createActorContext } from "@xstate/react";
import { PropsWithChildren } from "react";
import { useScreenReaderEnabled } from "../../../../../utils/accessibility";
import { selectItwEnv } from "../../../common/store/selectors/environment";
import { useIOSelector } from "../../../../../store/hooks";
import actions from "./actions";
import actors from "./actors";
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
  const eidIssuanceMachine = itwCieMachine.provide({ actions, actors });
  const env = useIOSelector(selectItwEnv);

  return (
    <ItwCieMachineContext.Provider
      logic={eidIssuanceMachine}
      options={{
        input: { pin, authenticationUrl, isScreenReaderEnabled, env }
      }}
    >
      {children}
    </ItwCieMachineContext.Provider>
  );
};
