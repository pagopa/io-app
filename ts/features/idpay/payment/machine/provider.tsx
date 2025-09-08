import { createActorContext } from "@xstate/react";

import { ReactNode } from "react";
import {
  idPayApiBaseUrl,
  idPayApiUatBaseUrl,
  idPayApiUatVersion,
  idPayApiVersion,
  idPayTestToken
} from "../../../../config";
import { useIONavigation } from "../../../../navigation/params/AppParamsList";
import { useIODispatch, useIOSelector } from "../../../../store/hooks";
import { bpdTokenSelector } from "../../../authentication/common/store/selectors";
import { isPagoPATestEnabledSelector } from "../../../../store/reducers/persistedPreferences";
import { createIDPayClient } from "../../common/api/client";
import { createActionsImplementation } from "./actions";
import { createActorsImplementation } from "./actors";
import { idPayPaymentMachine } from "./machine";

type Props = {
  children: ReactNode;
};

export const IdPayPaymentMachineContext =
  createActorContext(idPayPaymentMachine);

export const IdPayPaymentMachineProvider = (props: Props) => {
  const dispatch = useIODispatch();
  const navigation = useIONavigation();

  const bpdToken = useIOSelector(bpdTokenSelector);
  const isPagoPATestEnabled = useIOSelector(isPagoPATestEnabledSelector);
  const apiVersion = isPagoPATestEnabled ? idPayApiUatVersion : idPayApiVersion;

  if (!bpdToken) {
    throw new Error("BDP token is undefined");
  }

  const token = idPayTestToken ?? bpdToken;

  const idPayClient = createIDPayClient(
    isPagoPATestEnabled ? idPayApiUatBaseUrl : idPayApiBaseUrl,
    apiVersion
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
