import { createActorContext } from "@xstate/react";
import React from "react";
import { useIONavigation } from "../../../../navigation/params/AppParamsList";
import { useIOStore } from "../../../../store/hooks";
import { StoredCredential } from "../../common/utils/itwTypesUtils";
import { createItwTrustmarkActionsImplementation } from "./actions";
import { createItwTrustmarkActorsImplementation } from "./actors";
import { createItwTrustmarkGuardsImplementation } from "./guards";
import { itwTrustmarkMachine } from "./machine";

type Props = React.PropsWithChildren<{
  walletInstanceAttestation: string;
  credential: StoredCredential;
}>;

export const ItwTrustmarkMachineContext =
  createActorContext(itwTrustmarkMachine);

export const ItwTrustmarkMachineProvider = ({
  credential,
  walletInstanceAttestation,
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
      options={{ input: { credential, walletInstanceAttestation } }}
    >
      {children}
    </ItwTrustmarkMachineContext.Provider>
  );
};
