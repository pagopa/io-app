import { createActorContext } from "@xstate/react";
import React from "react";
import { useIONavigation } from "../../../../navigation/params/AppParamsList";
import { useIOStore } from "../../../../store/hooks";
import { createItwTrustmarkActionsImplementation } from "./actions";
import { createItwTrustmarkActorsImplementation } from "./actors";
import { createItwTrustmarkGuardsImplementation } from "./guards";
import { itwTrustmarkMachine } from "./machine";

type Props = React.PropsWithChildren<{
  credentialType: string;
}>;

export const ItwTrustmarkMachineContext =
  createActorContext(itwTrustmarkMachine);

export const ItwTrustmarkMachineProvider = ({
  credentialType,
  children
}: Props) => {
  const store = useIOStore();
  const navigation = useIONavigation();

  const trustmarkMachine = itwTrustmarkMachine.provide({
    actions: createItwTrustmarkActionsImplementation(store, navigation),
    actors: createItwTrustmarkActorsImplementation(store),
    guards: createItwTrustmarkGuardsImplementation()
  });

  return (
    <ItwTrustmarkMachineContext.Provider
      logic={trustmarkMachine}
      options={{ input: { credentialType } }}
    >
      {children}
    </ItwTrustmarkMachineContext.Provider>
  );
};
