import { createActorContext } from "@xstate5/react";
import * as React from "react";
import { useIONavigation } from "../../../navigation/params/AppParamsList";
import { useIODispatch, useIOSelector } from "../../../store/hooks";
import { isMixpanelEnabled } from "../../../store/reducers/persistedPreferences";
import { isFastLoginEnabledSelector } from "../../fastLogin/store/selectors";
import { lollipopKeyTagSelector } from "../../lollipop/store/reducers/lollipop";
import { createIdentificationActionsImplementation } from "./identification/actions";
import { createIdentificationActorsImplementation } from "./identification/actors";
import { itwIdentificationMachine } from "./identification/machine";
import { createIssuanceActionsImplementation } from "./issuance/actions";
import { createIssuanceActorsImplementation } from "./issuance/actors";
import { itwIssuanceMachine } from "./issuance/machine";

type Props = {
  children: JSX.Element;
};

export const ItWalletIssuanceMachineContext =
  createActorContext(itwIssuanceMachine);

export const ItWalletIssuanceMachineProvider = (props: Props) => {
  const navigation = useIONavigation();
  const dispatch = useIODispatch();

  const maybeKeyTag = useIOSelector(lollipopKeyTagSelector);
  const isFastLogin = useIOSelector(isFastLoginEnabledSelector);
  const mixpanelEnabled = useIOSelector(isMixpanelEnabled);

  const identificationActions =
    createIdentificationActionsImplementation(navigation);
  const identificationActors = createIdentificationActorsImplementation(
    maybeKeyTag,
    mixpanelEnabled,
    isFastLogin,
    dispatch
  );

  const identificationMachine = itwIdentificationMachine.provide({
    actors: identificationActors,
    actions: identificationActions
  });

  const issuanceActions = createIssuanceActionsImplementation(navigation);
  const issuanceActors = createIssuanceActorsImplementation();

  const issuanceMachine = itwIssuanceMachine.provide({
    actions: issuanceActions,
    actors: {
      ...issuanceActors,
      identificationMachine
    }
  });

  return (
    <ItWalletIssuanceMachineContext.Provider logic={issuanceMachine}>
      {props.children}
    </ItWalletIssuanceMachineContext.Provider>
  );
};
