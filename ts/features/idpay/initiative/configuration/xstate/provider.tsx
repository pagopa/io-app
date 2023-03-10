import { useNavigation } from "@react-navigation/native";
import { useInterpret } from "@xstate/react";
import * as E from "fp-ts/lib/Either";
import { pipe } from "fp-ts/lib/function";
import * as O from "fp-ts/lib/Option";
import React from "react";
import { InterpreterFrom } from "xstate";
import { PreferredLanguageEnum } from "../../../../../../definitions/backend/PreferredLanguage";
import { PaymentManagerClient } from "../../../../../api/pagopa";
import {
  fetchPaymentManagerLongTimeout,
  idPayApiBaseUrl,
  idPayApiUatBaseUrl,
  idPayTestToken,
  pagoPaApiUrlPrefix,
  pagoPaApiUrlPrefixTest
} from "../../../../../config";
import { useXStateMachine } from "../../../../../hooks/useXStateMachine";
import {
  AppParamsList,
  IOStackNavigationProp
} from "../../../../../navigation/params/AppParamsList";
import { useIOSelector } from "../../../../../store/hooks";
import { sessionInfoSelector } from "../../../../../store/reducers/authentication";
import {
  isPagoPATestEnabledSelector,
  preferredLanguageSelector
} from "../../../../../store/reducers/persistedPreferences";
import { defaultRetryingFetch } from "../../../../../utils/fetch";
import { fromLocaleToPreferredLanguage } from "../../../../../utils/locale";
import { SessionManager } from "../../../../../utils/SessionManager";
import { createIDPayClient } from "../../../common/api/client";
import { createActionsImplementation } from "./actions";
import {
  createIDPayInitiativeConfigurationMachine,
  IDPayInitiativeConfigurationMachineType
} from "./machine";
import { createServicesImplementation } from "./services";

type ConfigurationMachineContext =
  InterpreterFrom<IDPayInitiativeConfigurationMachineType>;

const ConfigurationMachineContext =
  React.createContext<ConfigurationMachineContext>(
    {} as ConfigurationMachineContext
  );

type Props = {
  children: React.ReactNode;
};

const IDPayConfigurationMachineProvider = (props: Props) => {
  const [machine] = useXStateMachine(createIDPayInitiativeConfigurationMachine);

  const sessionInfo = useIOSelector(sessionInfoSelector);
  const isPagoPATestEnabled = useIOSelector(isPagoPATestEnabledSelector);

  const language = pipe(
    useIOSelector(preferredLanguageSelector),
    O.map(fromLocaleToPreferredLanguage),
    O.getOrElse(() => PreferredLanguageEnum.it_IT)
  );

  const navigation = useNavigation<IOStackNavigationProp<AppParamsList>>();

  if (O.isNone(sessionInfo)) {
    throw new Error("Session info is undefined");
  }

  const { bpdToken, walletToken } = sessionInfo.value;

  const idPayToken = idPayTestToken !== undefined ? idPayTestToken : bpdToken;

  const paymentManagerClient = PaymentManagerClient(
    isPagoPATestEnabled ? pagoPaApiUrlPrefixTest : pagoPaApiUrlPrefix,
    walletToken,
    // despite both fetch have same configuration, keeping both ensures possible modding
    defaultRetryingFetch(fetchPaymentManagerLongTimeout, 0),
    defaultRetryingFetch(fetchPaymentManagerLongTimeout, 0)
  );

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
    isPagoPATestEnabled ? idPayApiUatBaseUrl : idPayApiBaseUrl
  );

  const services = createServicesImplementation(
    idPayClient,
    paymentManagerClient,
    pmSessionManager,
    idPayToken,
    language
  );

  const actions = createActionsImplementation(navigation);

  const machineService = useInterpret(machine, {
    actions,
    services
  });

  return (
    <ConfigurationMachineContext.Provider value={machineService}>
      {props.children}
    </ConfigurationMachineContext.Provider>
  );
};

const useConfigurationMachineService = () =>
  React.useContext(ConfigurationMachineContext);

export {
  IDPayConfigurationMachineProvider,
  useConfigurationMachineService,
  ConfigurationMachineContext
};
