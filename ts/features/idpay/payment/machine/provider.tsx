import { createActorContext } from "@xstate/react";
import * as O from "fp-ts/lib/Option";
import React from "react";
import {
  idPayApiBaseUrl,
  idPayApiUatBaseUrl,
  idPayTestToken
} from "../../../../config";
import { useIONavigation } from "../../../../navigation/params/AppParamsList";
import { useIODispatch, useIOSelector } from "../../../../store/hooks";
import { sessionInfoSelector } from "../../../../store/reducers/authentication";
import { isPagoPATestEnabledSelector } from "../../../../store/reducers/persistedPreferences";
import { createIDPayClient } from "../../common/api/client";
import { createActionsImplementation } from "./actions";
import { createActorsImplementation } from "./actors";
import { idPayPaymentMachine } from "./machine";

type Props = {
  children: React.ReactNode;
};

export const IdPayPaymentMachineContext =
  createActorContext(idPayPaymentMachine);

export const IdPayPaymentMachineProvider = (props: Props) => {
  const dispatch = useIODispatch();
  const navigation = useIONavigation();
  const sessionInfo = useIOSelector(sessionInfoSelector);
  const isPagoPATestEnabled = useIOSelector(isPagoPATestEnabledSelector);

  if (O.isNone(sessionInfo)) {
    throw new Error("Session info is undefined");
  }

  const { bpdToken } = sessionInfo.value;
  const token = idPayTestToken ?? bpdToken;

  const idPayClient = createIDPayClient(
    isPagoPATestEnabled ? idPayApiUatBaseUrl : idPayApiBaseUrl
  );

  const actors = createActorsImplementation(idPayClient, token, dispatch);
  const actions = createActionsImplementation(navigation);

  const machine = idPayPaymentMachine.provide({
    actors,
    actions
  });

  return (
    <IdPayPaymentMachineContext.Provider logic={machine}>
      {props.children}
    </IdPayPaymentMachineContext.Provider>
  );
};
