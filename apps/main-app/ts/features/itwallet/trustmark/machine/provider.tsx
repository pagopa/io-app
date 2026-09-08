import { useIOToast } from "@io-app/design-system";
import { createActorContext } from "@xstate/react";
import { PropsWithChildren } from "react";

import { useIONavigation } from "../../../../navigation/params/AppParamsList";
import { useIOSelector, useIOStore } from "../../../../store/hooks";
import { createInspector } from "../../../../utils/xstate/createInspector";
import {
  selectItwEnv,
  selectItwSpecsVersion
} from "../../common/store/selectors/environment";
import { getEnv } from "../../common/utils/environment";
import { createItwTrustmarkActionsImplementation } from "./actions";
import { createItwTrustmarkActorsImplementation } from "./actors";
import { createItwTrustmarkGuardsImplementation } from "./guards";
import { itwTrustmarkMachine } from "./machine";

const inspector = createInspector();

type Props = PropsWithChildren<{
  credentialType: string;
}>;

export const ItwTrustmarkMachineContext = createActorContext(
  itwTrustmarkMachine,
  inspector ? { inspect: inspector.inspect } : undefined
);

export const ItwTrustmarkMachineProvider = ({
  credentialType,
  children
}: Props) => {
  const store = useIOStore();
  const navigation = useIONavigation();
  const toast = useIOToast();

  const env = getEnv(useIOSelector(selectItwEnv));
  const itwVersion = useIOSelector(selectItwSpecsVersion);

  const trustmarkMachine = itwTrustmarkMachine.provide({
    actions: createItwTrustmarkActionsImplementation(store, navigation, toast),
    actors: createItwTrustmarkActorsImplementation(env, itwVersion, store),
    guards: createItwTrustmarkGuardsImplementation(itwVersion)
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
