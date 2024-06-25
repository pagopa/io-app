import { createActorContext } from "@xstate5/react";
import * as React from "react";
import { useIONavigation } from "../../../navigation/params/AppParamsList";
import createCredentialIssuanceActionsImplementation from "./credential/actions";
import createCredentialIssuanceActorsImplementation from "./credential/actors";
import { itwCredentialIssuanceMachine } from "./credential/machine";
import createEidIssuanceActionsImplementation from "./eid/actions";
import createEidIssuanceActorsImplementation from "./eid/actors";
import { itwEidIssuanceMachine } from "./eid/machine";
import createIdentificationActionsImplementation from "./identification/actions";
import createIdentificationActorsImplementation from "./identification/actors";
import { itwIdentificationMachine } from "./identification/machine";

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
  const navigation = useIONavigation();

  const identificationMachine = itwIdentificationMachine.provide({
    actions: createIdentificationActionsImplementation(navigation),
    actors: createIdentificationActorsImplementation()
  });

  const eidIssuanceMachine = itwEidIssuanceMachine.provide({
    actions: createEidIssuanceActionsImplementation(navigation),
    actors: {
      ...createEidIssuanceActorsImplementation(),
      identificationMachine
    }
  });

  const credentialIssuanceMachine = itwCredentialIssuanceMachine.provide({
    actions: createCredentialIssuanceActionsImplementation(navigation),
    actors: createCredentialIssuanceActorsImplementation()
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
