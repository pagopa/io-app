import { useIOToast } from "@pagopa/io-app-design-system";
import { createActorContext } from "@xstate5/react";
import * as React from "react";
import { useIONavigation } from "../../../navigation/params/AppParamsList";
import { useIODispatch, useIOStore } from "../../../store/hooks";
import { itwBypassIdentityMatch } from "../../../config";
import createCredentialIssuanceActionsImplementation from "./credential/actions";
import createCredentialIssuanceActorsImplementation from "./credential/actors";
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
  const dispatch = useIODispatch();
  const navigation = useIONavigation();
  const toast = useIOToast();

  const eidIssuanceMachine = itwEidIssuanceMachine.provide({
    guards: createEidIssuanceGuardsImplementation(store, {
      bypassIdentityMatch: itwBypassIdentityMatch
    }),
    actions: createEidIssuanceActionsImplementation(
      navigation,
      dispatch,
      toast
    ),
    actors: createEidIssuanceActorsImplementation(store)
  });

  const credentialIssuanceMachine = itwCredentialIssuanceMachine.provide({
    actions: createCredentialIssuanceActionsImplementation(
      navigation,
      dispatch,
      toast
    ),
    actors: createCredentialIssuanceActorsImplementation(store)
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
