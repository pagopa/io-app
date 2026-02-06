import { createActorContext } from "@xstate/react";
import * as E from "fp-ts/lib/Either";
import * as O from "fp-ts/lib/Option";
import { pipe } from "fp-ts/lib/function";

import { ReactNode } from "react";
import { PaymentManagerClient } from "../../../../api/pagopa";
import {
  fetchPaymentManagerLongTimeout,
  idPayApiBaseUrl,
  idPayApiUatBaseUrl,
  idPayApiUatVersion,
  idPayApiVersion,
  idPayTestToken,
  pagoPaApiUrlPrefix,
  pagoPaApiUrlPrefixTest
} from "../../../../config";
import { useIONavigation } from "../../../../navigation/params/AppParamsList";
import { useIODispatch, useIOSelector } from "../../../../store/hooks";
import {
  bpdTokenSelector,
  walletTokenSelector
} from "../../../authentication/common/store/selectors";
import {
  isPagoPATestEnabledSelector,
  preferredLanguageSelector
} from "../../../../store/reducers/persistedPreferences";
import { SessionManager } from "../../../../utils/SessionManager";
import { defaultRetryingFetch } from "../../../../utils/fetch";
import { PreferredLanguageEnum } from "../../../../../definitions/backend/identity/PreferredLanguage";
import { fromLocaleToPreferredLanguage } from "../../../../utils/locale";
import { createIDPayClient } from "../../common/api/client";
import { createActionsImplementation } from "./actions";
import { createActorsImplementation } from "./actors";
import { idPayConfigurationMachine } from "./machine";

type Props = {
  children: ReactNode;
};

export const IdPayConfigurationMachineContext = createActorContext(
  idPayConfigurationMachine
);

export const IDPayConfigurationMachineProvider = ({ children }: Props) => {
  const dispatch = useIODispatch();
  const navigation = useIONavigation();

  const walletToken = useIOSelector(walletTokenSelector);
  const bpdToken = useIOSelector(bpdTokenSelector);
  const isPagoPATestEnabled = useIOSelector(isPagoPATestEnabledSelector);

  const language = pipe(
    useIOSelector(preferredLanguageSelector),
    O.map(fromLocaleToPreferredLanguage),
    O.getOrElse(() => PreferredLanguageEnum.it_IT)
  );

  if (!bpdToken) {
    throw new Error("BDP token is undefined");
  }

  if (!walletToken) {
    throw new Error("Wallet token is undefined");
  }

  const idPayToken = idPayTestToken ?? bpdToken;

  const paymentManagerClient = PaymentManagerClient(
    isPagoPATestEnabled ? pagoPaApiUrlPrefixTest : pagoPaApiUrlPrefix,
    walletToken,
    // despite both fetch have same configuration, keeping both ensures possible modding
    defaultRetryingFetch(fetchPaymentManagerLongTimeout, 0),
    defaultRetryingFetch(fetchPaymentManagerLongTimeout, 0)
  );

  const apiVersion = isPagoPATestEnabled ? idPayApiUatVersion : idPayApiVersion;

  const getPaymentManagerSession = async () => {
    try {
      const response = await paymentManagerClient.getSession(walletToken);
      if (E.isRight(response) && response.right.status === 200) {
        return O.some(response.right.value.data.sessionToken);
      }
      return O.none;
    } catch {
      return O.none;
    }
  };

  const pmSessionManager = new SessionManager(getPaymentManagerSession);

  const idPayClient = createIDPayClient(
    isPagoPATestEnabled ? idPayApiUatBaseUrl : idPayApiBaseUrl,
    apiVersion
  );

  const actors = createActorsImplementation(
    idPayClient,
    paymentManagerClient,
    pmSessionManager,
    idPayToken,
    language
  );
  const actions = createActionsImplementation(navigation, dispatch);

  const machine = idPayConfigurationMachine.provide({
    actors,
    actions
  });

  return (
    <IdPayConfigurationMachineContext.Provider logic={machine}>
      {children}
    </IdPayConfigurationMachineContext.Provider>
  );
};
