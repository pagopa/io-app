import { useIOToast } from "@pagopa/io-app-design-system";
import { createActorContext } from "@xstate/react";
import { pipe } from "fp-ts/lib/function";
import { itwBypassIdentityMatch } from "../../../config";
import { useIONavigation } from "../../../navigation/params/AppParamsList";
import { useIOSelector, useIOStore } from "../../../store/hooks";
import { selectItwEnv } from "../common/store/selectors/environment";
import { getEnv } from "../common/utils/environment";
import { createCredentialIssuanceActionsImplementation } from "./credential/actions";
import { createCredentialIssuanceActorsImplementation } from "./credential/actors";
import { createCredentialIssuanceGuardsImplementation } from "./credential/guards";
import { itwCredentialIssuanceMachine } from "./credential/machine";
import { createEidIssuanceActionsImplementation } from "./eid/actions";
import { createEidIssuanceActorsImplementation } from "./eid/actors";
import { createEidIssuanceGuardsImplementation } from "./eid/guards";
import { itwEidIssuanceMachine } from "./eid/machine";

type Props = {
  children: JSX.Element;
};

export const ItwEidIssuanceMachineContext = createActorContext(
  itwEidIssuanceMachine
);

export const ItwCredentialIssuanceMachineContext = createActorContext(
  itwCredentialIssuanceMachine
);

export const ItWalletIssuanceMachineProvider = (props: Props) => {
  const store = useIOStore();
  const navigation = useIONavigation();
  const toast = useIOToast();

  const env = pipe(useIOSelector(selectItwEnv), getEnv);

  const eidIssuanceMachine = itwEidIssuanceMachine.provide({
    guards: createEidIssuanceGuardsImplementation(store, {
      bypassIdentityMatch: itwBypassIdentityMatch
    }),
    actions: createEidIssuanceActionsImplementation(navigation, store, toast),
    actors: createEidIssuanceActorsImplementation(env, store)
  });

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
    <ItwEidIssuanceMachineContext.Provider logic={eidIssuanceMachine}>
      <ItwCredentialIssuanceMachineContext.Provider
        logic={credentialIssuanceMachine}
      >
        {props.children}
      </ItwCredentialIssuanceMachineContext.Provider>
    </ItwEidIssuanceMachineContext.Provider>
  );
};
