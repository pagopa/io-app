import { useIOToast } from "@pagopa/io-app-design-system";
import { createActorContext } from "@xstate/react";
import { useIONavigation } from "../../../navigation/params/AppParamsList";
import { useIOStore } from "../../../store/hooks";
import { itwBypassIdentityMatch } from "../../../config";
import createCredentialIssuanceActionsImplementation from "./credential/actions";
import createCredentialIssuanceActorsImplementation from "./credential/actors";
import { itwCredentialIssuanceMachine } from "./credential/machine";
import { createEidIssuanceActionsImplementation } from "./eid/actions";
import { createEidIssuanceActorsImplementation } from "./eid/actors";
import { createEidIssuanceGuardsImplementation } from "./eid/guards";
import { itwEidIssuanceMachine } from "./eid/machine";
import { createCredentialIssuanceGuardsImplementation } from "./credential/guards";
import { itwRemotePresentationMachine } from "./remotePresentation/machine";
import { createRemotePresentationActorsImplementation } from "./remotePresentation/actors";
import { createRemotePresentationGuardsImplementation } from "./remotePresentation/guards";
import { createRemotePresentationActionsImplementation } from "./remotePresentation/actions";

type Props = {
  children: JSX.Element;
};

export const ItwEidIssuanceMachineContext = createActorContext(
  itwEidIssuanceMachine
);

export const ItwCredentialIssuanceMachineContext = createActorContext(
  itwCredentialIssuanceMachine
);

export const ItwRemotePresentationMachine = createActorContext(
  itwRemotePresentationMachine
);

export const ItWalletIssuanceMachineProvider = (props: Props) => {
  const store = useIOStore();
  const navigation = useIONavigation();
  const toast = useIOToast();

  const eidIssuanceMachine = itwEidIssuanceMachine.provide({
    guards: createEidIssuanceGuardsImplementation(store, {
      bypassIdentityMatch: itwBypassIdentityMatch
    }),
    actions: createEidIssuanceActionsImplementation(navigation, store, toast),
    actors: createEidIssuanceActorsImplementation(store)
  });

  const credentialIssuanceMachine = itwCredentialIssuanceMachine.provide({
    guards: createCredentialIssuanceGuardsImplementation(store),
    actions: createCredentialIssuanceActionsImplementation(
      navigation,
      store,
      toast
    ),
    actors: createCredentialIssuanceActorsImplementation(store)
  });

  const remotePresentationMachine = itwRemotePresentationMachine.provide({
    guards: createRemotePresentationGuardsImplementation(),
    actions: createRemotePresentationActionsImplementation(),
    actors: createRemotePresentationActorsImplementation()
  });

  return (
    <ItwEidIssuanceMachineContext.Provider logic={eidIssuanceMachine}>
      <ItwCredentialIssuanceMachineContext.Provider
        logic={credentialIssuanceMachine}
      >
        <ItwRemotePresentationMachine.Provider
          logic={remotePresentationMachine}
        >
          {props.children}
        </ItwRemotePresentationMachine.Provider>
      </ItwCredentialIssuanceMachineContext.Provider>
    </ItwEidIssuanceMachineContext.Provider>
  );
};
