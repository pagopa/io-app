import { useIOToast } from "@pagopa/io-app-design-system";
import { createActorContext } from "@xstate/react";
import { pipe } from "fp-ts/lib/function";
import { PropsWithChildren } from "react";
import { useIONavigation } from "../../../../navigation/params/AppParamsList";
import { useIOSelector, useIOStore } from "../../../../store/hooks";
import { selectItwEnv } from "../../common/store/selectors/environment";
import { getEnv } from "../../common/utils/environment";
import { createCredentialIssuanceActionsImplementation } from "./../credential/actions";
import { createCredentialIssuanceActorsImplementation } from "./../credential/actors";
import { createCredentialIssuanceGuardsImplementation } from "./../credential/guards";
import { itwCredentialIssuanceMachine } from "./../credential/machine";

export const ItwCredentialIssuanceMachineContext = createActorContext(
  itwCredentialIssuanceMachine
);

export const ItwCredentialIssuanceMachineProvider = (
  props: PropsWithChildren
) => {
  const store = useIOStore();
  const navigation = useIONavigation();
  const toast = useIOToast();

  const env = pipe(useIOSelector(selectItwEnv), getEnv);

  const credentialIssuanceMachine = itwCredentialIssuanceMachine.provide({
    guards: createCredentialIssuanceGuardsImplementation(store),
    actions: createCredentialIssuanceActionsImplementation(
      navigation,
      store,
      toast
    ),
    actors: createCredentialIssuanceActorsImplementation(env, store)
  });

  return (
    <ItwCredentialIssuanceMachineContext.Provider
      logic={credentialIssuanceMachine}
    >
      {props.children}
    </ItwCredentialIssuanceMachineContext.Provider>
  );
};
