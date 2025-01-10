import { useIOToast } from "@pagopa/io-app-design-system";
import { createActorContext } from "@xstate/react";

import { PropsWithChildren } from "react";
import { useIONavigation } from "../../../../navigation/params/AppParamsList";
import { useIOStore } from "../../../../store/hooks";
import { createItwTrustmarkActionsImplementation } from "./actions";
import { createItwTrustmarkActorsImplementation } from "./actors";
import { createItwTrustmarkGuardsImplementation } from "./guards";
import { itwTrustmarkMachine } from "./machine";

type Props = PropsWithChildren<{
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
  const toast = useIOToast();

  const trustmarkMachine = itwTrustmarkMachine.provide({
    actions: createItwTrustmarkActionsImplementation(store, navigation, toast),
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
