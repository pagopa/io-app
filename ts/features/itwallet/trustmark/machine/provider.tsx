import { useIOToast } from "@pagopa/io-app-design-system";
import { createActorContext } from "@xstate/react";
import { pipe } from "fp-ts/lib/function";
import { PropsWithChildren } from "react";
import { useIONavigation } from "../../../../navigation/params/AppParamsList";
import { useIOSelector, useIOStore } from "../../../../store/hooks";
import { selectItwEnv } from "../../common/store/selectors/environment";
import { getEnv } from "../../common/utils/environment";
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

  const env = pipe(useIOSelector(selectItwEnv), getEnv);

  const trustmarkMachine = itwTrustmarkMachine.provide({
    actions: createItwTrustmarkActionsImplementation(store, navigation, toast),
    actors: createItwTrustmarkActorsImplementation(env, store),
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
