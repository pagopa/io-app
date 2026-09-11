import { useIOToast } from "@io-app/design-system";
import { createBrowserInspector } from "@io-app/xstate-inspector";
import { createActorContext } from "@xstate/react";
import { PropsWithChildren } from "react";

import { useIONavigation } from "../../../../navigation/params/AppParamsList";
import { useIOSelector, useIOStore } from "../../../../store/hooks";
import {
  selectItwEnv,
  selectItwSpecsVersion
} from "../../common/store/selectors/environment";
import { getEnv } from "../../common/utils/environment";
import { createCredentialIssuanceActionsImplementation } from "./actions.ts";
import { createCredentialIssuanceActorsImplementation } from "./actors.ts";
import { createCredentialIssuanceGuardsImplementation } from "./guards.ts";
import { itwCredentialIssuanceMachine } from "./machine.ts";

const inspector = createBrowserInspector();

export const ItwCredentialIssuanceMachineContext = createActorContext(
  itwCredentialIssuanceMachine,
  inspector ? { inspect: inspector.inspect } : undefined
);

export const ItwCredentialIssuanceMachineProvider = (
  props: PropsWithChildren
) => {
  const store = useIOStore();
  const navigation = useIONavigation();
  const toast = useIOToast();

  const env = getEnv(useIOSelector(selectItwEnv));
  const itwVersion = useIOSelector(selectItwSpecsVersion);

  const credentialIssuanceMachine = itwCredentialIssuanceMachine.provide({
    guards: createCredentialIssuanceGuardsImplementation(store, itwVersion),
    actions: createCredentialIssuanceActionsImplementation(
      navigation,
      store,
      toast
    ),
    actors: createCredentialIssuanceActorsImplementation(env, itwVersion, store)
  });

  return (
    <ItwCredentialIssuanceMachineContext.Provider
      logic={credentialIssuanceMachine}
    >
      {props.children}
    </ItwCredentialIssuanceMachineContext.Provider>
  );
};
