import * as pot from "@pagopa/ts-commons/lib/pot";
import { useNavigation } from "@react-navigation/native";
import { useInterpret } from "@xstate/react";
import { pipe } from "fp-ts/lib/function";
import * as O from "fp-ts/lib/Option";
import React from "react";
import { InterpreterFrom } from "xstate";
import { PreferredLanguageEnum } from "../../../../../definitions/backend/PreferredLanguage";
import { InitiativeDTO } from "../../../../../definitions/idpay/InitiativeDTO";
import {
  idPayApiBaseUrl,
  idPayApiUatBaseUrl,
  idPayTestToken
} from "../../../../config";
import { useXStateMachine } from "../../../../hooks/useXStateMachine";
import {
  AppParamsList,
  IOStackNavigationProp
} from "../../../../navigation/params/AppParamsList";
import { useIOSelector } from "../../../../store/hooks";
import { sessionInfoSelector } from "../../../../store/reducers/authentication";
import {
  isPagoPATestEnabledSelector,
  preferredLanguageSelector
} from "../../../../store/reducers/persistedPreferences";
import { fromLocaleToPreferredLanguage } from "../../../../utils/locale";
import { createIDPayClient } from "../../common/api/client";
import { idpayInitiativeDetailsSelector } from "../../initiative/details/store";
import { createActionsImplementation } from "./actions";
import {
  createIDPayUnsubscriptionMachine,
  IDPayUnsubscriptionMachineType
} from "./machine";
import { createServicesImplementation } from "./services";

type UnsubscriptionMachineContext =
  InterpreterFrom<IDPayUnsubscriptionMachineType>;

const UnsubscriptionMachineContext =
  React.createContext<UnsubscriptionMachineContext>(
    {} as UnsubscriptionMachineContext
  );

type Props = {
  children: React.ReactNode;
};

const IDPayUnsubscriptionMachineProvider = (props: Props) => {
  const initiativeFromSelector = useIOSelector(idpayInitiativeDetailsSelector);

  const initiative: InitiativeDTO | undefined = pot.getOrElse(
    initiativeFromSelector,
    undefined
  );

  if (initiative === undefined) {
    throw new Error("Undefined initiative");
  }

  const [machine] = useXStateMachine(
    createIDPayUnsubscriptionMachine,
    initiative
  );

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

  const { bpdToken } = sessionInfo.value;

  const idPayToken = idPayTestToken !== undefined ? idPayTestToken : bpdToken;

  const idPayClient = createIDPayClient(
    isPagoPATestEnabled ? idPayApiUatBaseUrl : idPayApiBaseUrl
  );

  const services = createServicesImplementation(
    idPayClient,
    idPayToken,
    language
  );

  const actions = createActionsImplementation(navigation);

  const machineService = useInterpret(machine, {
    actions,
    services
  });

  return (
    <UnsubscriptionMachineContext.Provider value={machineService}>
      {props.children}
    </UnsubscriptionMachineContext.Provider>
  );
};

const useUnsubscriptionMachineService = () =>
  React.useContext(UnsubscriptionMachineContext);

export {
  IDPayUnsubscriptionMachineProvider,
  useUnsubscriptionMachineService,
  UnsubscriptionMachineContext
};
