import { useIOToast } from "@pagopa/io-app-design-system";
import { createActorContext } from "@xstate/react";
import { pipe } from "fp-ts/lib/function";
import * as O from "fp-ts/lib/Option";
import { PropsWithChildren } from "react";
import { useIONavigation } from "../../../../navigation/params/AppParamsList";
import { useIOSelector, useIOStore } from "../../../../store/hooks";
import { selectItwEnv } from "../../common/store/selectors/environment";
import { getEnv } from "../../common/utils/environment";
import { itwCredentialsSelector } from "../../credentials/store/selectors";
import { itwIntegrityKeyTagSelector } from "../../issuance/store/selectors";
import { itwWalletInstanceAttestationSelector } from "../../walletInstance/store/selectors";
import { createEidIssuanceActionsImplementation } from "./../eid/actions";
import { createEidIssuanceActorsImplementation } from "./../eid/actors";
import { createEidIssuanceGuardsImplementation } from "./../eid/guards";
import { itwEidIssuanceMachine } from "./../eid/machine";

export const ItwEidIssuanceMachineContext = createActorContext(
  itwEidIssuanceMachine
);

export const ItwEidIssuanceMachineProvider = (props: PropsWithChildren) => {
  const store = useIOStore();
  const navigation = useIONavigation();
  const toast = useIOToast();

  const integrityKeyTag = O.toUndefined(
    useIOSelector(itwIntegrityKeyTagSelector)
  );
  const walletInstanceAttestation = useIOSelector(
    itwWalletInstanceAttestationSelector
  );
  const credentials = Object.values(useIOSelector(itwCredentialsSelector));

  const env = pipe(useIOSelector(selectItwEnv), getEnv);

  const eidIssuanceMachine = itwEidIssuanceMachine.provide({
    guards: createEidIssuanceGuardsImplementation(store, {
      bypassIdentityMatch: env.BYPASS_IDENTITY_MATCH
    }),
    actions: createEidIssuanceActionsImplementation(navigation, store, toast),
    actors: createEidIssuanceActorsImplementation(env, store)
  });

  return (
    <ItwEidIssuanceMachineContext.Provider
      logic={eidIssuanceMachine}
      options={{
        input: { integrityKeyTag, walletInstanceAttestation, credentials }
      }}
    >
      {props.children}
    </ItwEidIssuanceMachineContext.Provider>
  );
};
